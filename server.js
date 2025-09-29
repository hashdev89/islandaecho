const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const express = require('express')
const compression = require('compression')
const helmet = require('helmet')
const morgan = require('morgan')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 3000

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Initialize Express
const server = express()

// Security middleware
server.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.mapbox.com", "https://events.mapbox.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// Compression middleware
server.use(compression())

// Logging middleware
if (dev) {
  server.use(morgan('dev'))
} else {
  server.use(morgan('combined'))
}

// Trust proxy for accurate IP addresses
server.set('trust proxy', 1)

// Custom API routes (if needed)
server.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Custom middleware for admin routes
server.use('/admin', (req, res, next) => {
  // Add custom admin authentication logic here
  // For now, we'll just log admin access
  console.log(`Admin access attempt: ${req.ip} - ${req.url}`)
  next()
})

// Custom middleware for API rate limiting (basic implementation)
const rateLimitMap = new Map()
server.use('/api', (req, res, next) => {
  const ip = req.ip
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100 // Max requests per window

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return next()
  }

  const userData = rateLimitMap.get(ip)
  
  if (now > userData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return next()
  }

  if (userData.count >= maxRequests) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      retryAfter: Math.ceil((userData.resetTime - now) / 1000) 
    })
  }

  userData.count++
  next()
})

// Static file serving with cache headers
server.use('/static', express.static('public', {
  maxAge: dev ? 0 : '1y',
  etag: true,
  lastModified: true
}))

// Custom error handling
server.use((err, req, res, next) => {
  console.error('Server error:', err)
  
  if (res.headersSent) {
    return next(err)
  }
  
  res.status(500).json({
    error: dev ? err.message : 'Internal Server Error',
    ...(dev && { stack: err.stack })
  })
})

// Prepare Next.js app
app.prepare().then(() => {
  // Handle all other requests with Next.js
  server.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Start the server
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`> Compression: enabled`)
    console.log(`> Security headers: enabled`)
    console.log(`> Rate limiting: enabled`)
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
    process.exit(0)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})
