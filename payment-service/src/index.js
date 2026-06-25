const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const { PgPaymentRepository } = require('./infrastructure/persistence/pg-payment.repository');
const { RabbitMqPublisher } = require('./infrastructure/messaging/rabbitmq-publisher');
const { RabbitMqConsumer } = require('./infrastructure/messaging/rabbitmq-consumer');
const { ProcessPaymentUseCase } = require('./application/process-payment.use-case');
const { PaymentController } = require('./interface/payment.controller');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'payment_service',
});

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const EXCHANGE_EVENTS = 'events';

const paymentRepository = new PgPaymentRepository(pool);
const publisher = new RabbitMqPublisher({ publish: () => {} }, EXCHANGE_EVENTS); // stub until channel ready
const processPaymentUseCase = new ProcessPaymentUseCase(paymentRepository, publisher);
const paymentController = new PaymentController(processPaymentUseCase, paymentRepository, publisher);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/payments/:orderId/process', (req, res) => paymentController.process(req, res));
app.get('/payments/:orderId', (req, res) => paymentController.getByOrder(req, res));
app.post('/refunds/:orderId', (req, res) => paymentController.refund(req, res));

const initDb = async (retries = 5) => {
  try {
    await paymentRepository.init();
    console.log('Database initialized');
  } catch (err) {
    if (retries === 0) {
      console.error('Database init failed:', err.message);
      return;
    }
    console.log(`DB connection failed, retrying in 5s... (${retries} left)`);
    setTimeout(() => initDb(retries - 1), 5000);
  }
};

const amqp = require('amqplib');
const startRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_EVENTS, 'topic', { durable: true });
    publisher.channel = channel;

    const consumer = new RabbitMqConsumer(paymentRepository);
    await consumer.connect(RABBITMQ_URL, EXCHANGE_EVENTS);
  } catch (err) {
    console.error('RabbitMQ setup failed:', err.message);
  }
};

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Payment API running on port ${PORT}`);
  initDb();
  setTimeout(startRabbitMQ, 2000);
});
