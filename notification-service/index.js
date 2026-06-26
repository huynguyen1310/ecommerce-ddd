const express = require('express')
const CatalogClient = require('./src/infrastructure/catalog-client')
const MailProvider = require('./src/infrastructure/mail-provider')
const NotificationRepository = require('./src/infrastructure/notification-repository')
const SendOrderEmailUseCase = require('./src/application/send-order-email.use-case')
const SendShippedEmailUseCase = require('./src/application/send-shipped-email.use-case')
const SendPaymentEmailUseCase = require('./src/application/send-payment-email.use-case')
const RabbitMQConsumer = require('./src/infrastructure/rabbitmq-consumer')

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'
const MAIL_HOST = process.env.MAIL_HOST || 'mailhog'
const MAIL_PORT = process.env.MAIL_PORT || 1025
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://catalog-service:9000/api/products'
const DB_URL = process.env.NOTIFICATION_DB_URL || 'postgres://user:password@notification-db:5432/notification_service'
const PORT = process.env.PORT || 4002

const app = express()
app.use(express.json())

const start = async () => {
  const catalogClient = new CatalogClient(CATALOG_SERVICE_URL)
  const mailProvider = new MailProvider(MAIL_HOST, MAIL_PORT)
  const notifRepo = new NotificationRepository(DB_URL)
  await notifRepo.init()

  const sendOrderEmailUseCase = new SendOrderEmailUseCase(catalogClient, mailProvider)
  const sendShippedEmailUseCase = new SendShippedEmailUseCase(mailProvider)
  const sendPaymentEmailUseCase = new SendPaymentEmailUseCase(mailProvider)
  const rabbitMQConsumer = new RabbitMQConsumer(RABBITMQ_URL, sendOrderEmailUseCase, sendShippedEmailUseCase, sendPaymentEmailUseCase, mailProvider, notifRepo)
  rabbitMQConsumer.start()

  // REST endpoints
  app.get('/notifications', async (req, res) => {
    try {
      const userId = req.query.user_id
      if (!userId) return res.status(400).json({ error: 'user_id required' })
      const page = parseInt(req.query.page) || 1
      const result = await notifRepo.findByUser(userId, { page })
      res.json(result)
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  app.get('/notifications/unread-count', async (req, res) => {
    try {
      const userId = req.query.user_id
      if (!userId) return res.status(400).json({ error: 'user_id required' })
      const count = await notifRepo.unreadCount(userId)
      res.json({ count })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  app.patch('/notifications/:id/read', async (req, res) => {
    try {
      await notifRepo.markRead(req.params.id)
      res.json({ message: 'ok' })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  app.post('/notifications/read-all', async (req, res) => {
    try {
      const userId = req.body.user_id
      if (!userId) return res.status(400).json({ error: 'user_id required' })
      await notifRepo.markAllRead(userId)
      res.json({ message: 'ok' })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  app.listen(PORT, () => {
    console.log(`[Notification Service] HTTP server on port ${PORT}`)
  })
}

console.log('[Notification Service] Starting...')
start().catch(err => {
  console.error('[Notification Service] Startup error:', err.message)
  process.exit(1)
})
