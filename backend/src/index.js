import dotenv from 'dotenv'
dotenv.config()

import { initDatabase } from './db/init.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { app } from './app.js'
const PORT = process.env.PORT || 3001

await initDatabase()

const server = createServer(app)

// Configure Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000',
      'https://localhost:5173',
      'https://localhost:5174',
      'https://localhost:3000',
      /^https?:\/\/([a-z0-9-]+)-\d+\.app\.github\.dev$/,
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  allowEIO3: true,
  transports: ['polling', 'websocket'],
})

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Test event for debugging
  socket.emit('connection-test', {
    message: 'Successfully connected to server',
    socketId: socket.id,
  })

  // Handle test messages from client
  socket.on('test-message', (data) => {
    console.log('Received test message from client:', data)
    socket.emit('test-response', {
      message: 'Server received your test message!',
      originalMessage: data.message,
    })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Make io accessible to routes
app.set('io', io)

server.listen(PORT, () => {
  console.info(
    `Express server with Socket.IO running on http://localhost:${PORT}`,
  )
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try:`)
    console.error(`- Kill the process: lsof -ti:${PORT} | xargs kill -9`)
    console.error(`- Use a different port: PORT=3002 npm run start`)
    console.error(`- Stop Docker services: docker compose stop`)
    process.exit(1)
  } else {
    console.error('Server error:', err)
    process.exit(1)
  }
})
