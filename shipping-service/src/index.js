const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const { PgShipmentRepository } = require('./infrastructure/persistence/pg-shipment.repository');
const { CreateShipmentUseCase } = require('./application/create-shipment.use-case');
const { RabbitMqPublisher } = require('./infrastructure/messaging/rabbitmq-publisher');
const { RabbitMqConsumer } = require('./infrastructure/messaging/rabbitmq-consumer');
const { ShippingController } = require('./interface/shipping.controller');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'shipping_service',
});

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const EXCHANGE_EVENTS = 'events';

const shipmentRepository = new PgShipmentRepository(pool);
const publisher = new RabbitMqPublisher({ publish: () => {} }, EXCHANGE_EVENTS);
const createShipmentUseCase = new CreateShipmentUseCase(shipmentRepository, publisher);
const shippingController = new ShippingController(shipmentRepository);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/shipments/:orderId', (req, res) => shippingController.getByOrder(req, res));

const initDb = async (retries = 5) => {
  try {
    await shipmentRepository.init();
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

    const consumer = new RabbitMqConsumer(createShipmentUseCase);
    await consumer.connect(RABBITMQ_URL, EXCHANGE_EVENTS);
  } catch (err) {
    console.error('RabbitMQ setup failed:', err.message);
  }
};

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Shipping API running on port ${PORT}`);
  initDb();
  setTimeout(startRabbitMQ, 2000);
});
