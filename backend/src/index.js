import dotenv from 'dotenv'
dotenv.config()

import { initDatabase } from './db/init.js'

import { app } from './app.js'
const PORT = process.env.PORT || 3001

await initDatabase()

const server = app.listen(PORT, () => {
  console.info(`Express server running on http://localhost:${PORT}`)
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
