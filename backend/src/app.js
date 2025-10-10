import express from 'express'
import { recipesRoutes } from './routes/recipes.js'
import { userRoutes } from './routes/users.js'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()

// Configure CORS to allow frontend development server
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:5174', // Vite dev server (alt port)
    'http://localhost:3000', // Docker frontend
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(bodyParser.json())

recipesRoutes(app)
userRoutes(app)

app.get('/', (req, res) => {
  res.send('Hello from Express Live!!')
})

export { app }
