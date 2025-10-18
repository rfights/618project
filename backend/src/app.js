import express from 'express'
import { recipesRoutes } from './routes/recipes.js'
import { userRoutes } from './routes/users.js'
import { uploadRoutes } from './routes/upload.js'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Configure CORS to allow frontend development server (including Codespaces)
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'https://localhost:5173',
  'https://localhost:5174',
  'https://localhost:3000',
  'https://127.0.0.1:5173',
  'https://127.0.0.1:5174',
  'https://127.0.0.1:3000',
])

const codespacesOriginRegex = /^https?:\/\/([a-z0-9-]+)-\d+\.app\.github\.dev$/

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true)

    if (allowedOrigins.has(origin) || codespacesOriginRegex.test(origin)) {
      return callback(null, true)
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`))
  },
  credentials: true,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(bodyParser.json())

// Serve uploaded files statically
app.use('/api/v1/uploads', express.static(path.join(__dirname, '../uploads')))

// Attach like/unlike services to app for use in routes
import * as recipeServices from './services/recipes.js'
app.use((req, res, next) => {
  req.services = recipeServices
  next()
})
recipesRoutes(app)
userRoutes(app)
uploadRoutes(app)

app.get('/', (req, res) => {
  res.send('Hello from Express Live!!')
})

export { app }
