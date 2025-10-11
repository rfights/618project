import mongoose from 'mongoose'

export async function initDatabase() {
  let DATABASE_URL = process.env.DATABASE_URL

  // Fallback to in-memory MongoDB for local dev if no DATABASE_URL provided
  if (!DATABASE_URL || DATABASE_URL === 'memory') {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    const instance = await MongoMemoryServer.create()
    DATABASE_URL = instance.getUri()
    process.env.DATABASE_URL = DATABASE_URL
    // Attempt to stop the server on process exit
    process.on('exit', () => instance.stop())
    process.on('SIGINT', () => instance.stop())
  }

  mongoose.connection.on('open', () => {
    console.info('successfully connected to database:', DATABASE_URL)
  })
  return mongoose.connect(DATABASE_URL)
}
