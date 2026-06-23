const http = require('http')
const express = require('express')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = process.env.PORT || 8080
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

const publicPaths = [
  ['POST', '/login'],
  ['POST', '/register'],
  ['GET', '/api/products'],
  ['GET', '/api/products/'],
  ['GET', '/products/'],
  ['GET', '/cart'],
  ['POST', '/cart'],
  ['PATCH', '/cart'],
  ['DELETE', '/cart'],
]

const isPublic = (req) =>
  publicPaths.some(([method, prefix]) => req.method === method && req.path.startsWith(prefix))

app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.path}`)
  if (isPublic(req)) return next()
  authMiddleware(req, res, next)
})

const routeMap = [
  ['/api/products', 'http://catalog-service:9000'],
  ['/api/products/', 'http://catalog-service:9000'],
  ['/cart', 'http://cart-service:3004'],
  ['/orders', 'http://order-service:3000'],
  ['/payments', 'http://payment-service:3003'],
  ['/reviews', 'http://review-service:4000'],
  ['/products/', 'http://review-service:4000'],
  ['/shipments', 'http://shipping-service:4001'],
  ['/users', 'http://identity-service:3002'],
  ['/login', 'http://identity-service:3002'],
  ['/register', 'http://identity-service:3002'],
]

const proxyRequest = (target, req, res) => {
  const url = new URL(target + req.path)
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''),
    method: req.method,
    headers: { ...req.headers, host: url.hostname },
  }

  delete options.headers['access-control-request-headers']
  delete options.headers['access-control-request-method']

  console.log(`[Gateway] Proxy ${req.method} ${req.path} -> ${target}${req.path}`)

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res)
  })

  proxyReq.on('error', (err) => {
    console.error(`[Gateway] Proxy error:`, err.message)
    res.status(502).json({ error: 'Bad gateway' })
  })

  req.pipe(proxyReq)
}

app.use((req, res, next) => {
  for (const [prefix, target] of routeMap) {
    if (req.path.startsWith(prefix)) {
      return proxyRequest(target, req, res)
    }
  }
  res.status(502).json({ error: 'No route configured' })
})

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`)
  })
}

module.exports = { app, isPublic, authMiddleware, routeMap, proxyRequest }
