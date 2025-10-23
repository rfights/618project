import dotenv from 'dotenv'
dotenv.config()

import { initDatabase } from './db/init.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { app } from './app.js'
const PORT = process.env.PORT || 3000

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
})

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

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
