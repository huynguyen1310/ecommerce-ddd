const amqp = require('amqplib');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const EXCHANGE_EVENTS = 'events';

let channel;
const pendingPayments = new Map();

async function connectRabbitMQ(retries = 5) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_EVENTS, 'topic', { durable: true });
    
    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_EVENTS, 'inventory.deducted');

    console.log('Payment service listening for inventory.deducted...');

    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        const event = JSON.parse(msg.content.toString());
        const orderId = event.data.order_id;
        console.log('Tracked pending payment for order:', orderId);
        
        // Store order data to process it later manually, aggregating items across multiple events if necessary
        let existing = pendingPayments.get(orderId);
        if (!existing) {
          existing = {
            order_id: orderId,
            items: [],
            total: event.data.total || 0
          };
        }

        if (event.data.items && Array.isArray(event.data.items)) {
          event.data.items.forEach(newItem => {
            const found = existing.items.find(item => item.product_id === newItem.product_id);
            if (found) {
              found.quantity += newItem.quantity;
            } else {
              existing.items.push({
                product_id: newItem.product_id,
                quantity: newItem.quantity
              });
            }
          });
        } else if (event.data.product_id) {
          const qty = event.data.quantity_deducted || 1;
          const found = existing.items.find(item => item.product_id === event.data.product_id);
          if (found) {
            found.quantity += qty;
          } else {
            existing.items.push({
              product_id: event.data.product_id,
              quantity: qty
            });
          }
        }
        
        pendingPayments.set(orderId, existing);
        
        channel.ack(msg);
      }
    });
  } catch (err) {
    if (retries === 0) throw err;
    console.log(`RabbitMQ retry in 5s... (${retries} left)`);
    setTimeout(() => connectRabbitMQ(retries - 1), 5000);
  }
}

app.post('/payments/:orderId/process', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // 'SUCCESS' or 'FAILURE'

  console.log(`Processing manual payment for order ${orderId} with status ${status}`);

  if (!pendingPayments.has(orderId)) {
    // In a real app, we might check a database. Here we check memory.
    // If it's not there, it might be because inventory hasn't been deducted yet.
    return res.status(404).json({ error: 'Order not ready for payment or not found' });
  }

  const orderData = pendingPayments.get(orderId);

  if (status === 'SUCCESS') {
    const paymentEvent = {
      event_id: Math.random().toString(36).substring(7),
      occurred_at: new Date().toISOString(),
      data: {
        order_id: orderId,
        transaction_id: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        status: 'SUCCESS'
      }
    };
    channel.publish(EXCHANGE_EVENTS, 'payment.completed', Buffer.from(JSON.stringify(paymentEvent)));
    console.log('Published payment.completed for order:', orderId);
  } else {
    const failureEvent = {
      event_id: Math.random().toString(36).substring(7),
      occurred_at: new Date().toISOString(),
      data: {
        order_id: orderId,
        reason: 'User cancelled or payment failed',
        items: orderData.items || []
      }
    };
    channel.publish(EXCHANGE_EVENTS, 'payment.failed', Buffer.from(JSON.stringify(failureEvent)));
    console.log('Published payment.failed for order:', orderId);
  }

  pendingPayments.delete(orderId);
  res.json({ message: `Payment ${status} processed` });
});

app.get('/payments/:orderId', (req, res) => {
  const { orderId } = req.params;
  if (pendingPayments.has(orderId)) {
    res.json(pendingPayments.get(orderId));
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Payment API running on port ${PORT}`);
  connectRabbitMQ();
});
