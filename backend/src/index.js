import dotenv from 'dotenv'
dotenv.config()

import { initDatabase } from './db/init.js'

import { app } from './app.js'
const PORT = process.env.PORT

await initDatabase()
app.listen(PORT, () => {
  console.info(`Express server running on https://localhost:${PORT}`)
})
