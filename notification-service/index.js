const CatalogClient = require('./src/infrastructure/catalog-client');
const MailProvider = require('./src/infrastructure/mail-provider');
const SendOrderEmailUseCase = require('./src/application/send-order-email.use-case');
const SendShippedEmailUseCase = require('./src/application/send-shipped-email.use-case');
const SendPaymentEmailUseCase = require('./src/application/send-payment-email.use-case');
const RabbitMQConsumer = require('./src/infrastructure/rabbitmq-consumer');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const MAIL_HOST = process.env.MAIL_HOST || 'mailhog';
const MAIL_PORT = process.env.MAIL_PORT || 1025;
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://catalog-service:9000/api/products';

const catalogClient = new CatalogClient(CATALOG_SERVICE_URL);
const mailProvider = new MailProvider(MAIL_HOST, MAIL_PORT);
const sendOrderEmailUseCase = new SendOrderEmailUseCase(catalogClient, mailProvider);
const sendShippedEmailUseCase = new SendShippedEmailUseCase(mailProvider);
const sendPaymentEmailUseCase = new SendPaymentEmailUseCase(mailProvider);
const rabbitMQConsumer = new RabbitMQConsumer(RABBITMQ_URL, sendOrderEmailUseCase, sendShippedEmailUseCase, sendPaymentEmailUseCase, mailProvider);

console.log('[Notification Service] Starting in Hexagonal mode...');
rabbitMQConsumer.start();
