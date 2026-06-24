const express = require('express')
const Redis = require('ioredis')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3004
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

const redis = new Redis(REDIS_URL)

app.use(cors())
app.use(express.json())

const cartKey = (userId) => `cart:${userId}`

app.get('/cart/:userId', async (req, res) => {
  try {
    const items = await redis.hgetall(cartKey(req.params.userId))
    const parsed = Object.entries(items).map(([productId, data]) => ({
      ...JSON.parse(data),
      productId,
    }))
    res.json(parsed)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/cart/:userId/items', async (req, res) => {
  try {
    const { productId, name, price, imageUrl, quantity, shopId, shopName } = req.body
    const key = cartKey(req.params.userId)
    const existing = await redis.hget(key, productId)
    const item = existing ? JSON.parse(existing) : { name, price, imageUrl }
    if (shopId) item.shopId = shopId
    if (shopName) item.shopName = shopName
    item.quantity = (item.quantity || 0) + (quantity || 1)
    await redis.hset(key, productId, JSON.stringify(item))
    const items = await redis.hgetall(key)
    const parsed = Object.entries(items).map(([pid, data]) => ({ ...JSON.parse(data), productId: pid }))
    res.json(parsed)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/cart/:userId/items/:productId', async (req, res) => {
  try {
    const { quantity } = req.body
    const key = cartKey(req.params.userId)
    const existing = await redis.hget(key, req.params.productId)
    if (!existing) return res.status(404).json({ error: 'Item not in cart' })
    const item = JSON.parse(existing)
    item.quantity = quantity
    if (quantity <= 0) {
      await redis.hdel(key, req.params.productId)
    } else {
      await redis.hset(key, req.params.productId, JSON.stringify(item))
    }
    const items = await redis.hgetall(key)
    const parsed = Object.entries(items).map(([pid, data]) => ({ ...JSON.parse(data), productId: pid }))
    res.json(parsed)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/cart/:userId/items/:productId', async (req, res) => {
  try {
    await redis.hdel(cartKey(req.params.userId), req.params.productId)
    const items = await redis.hgetall(cartKey(req.params.userId))
    const parsed = Object.entries(items).map(([pid, data]) => ({ ...JSON.parse(data), productId: pid }))
    res.json(parsed)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/cart/:userId', async (req, res) => {
  try {
    await redis.del(cartKey(req.params.userId))
    res.json([])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => console.log(`Cart service on :${PORT}`))
