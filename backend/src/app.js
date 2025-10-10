import express from 'express'
import { recipesRoutes } from './routes/recipes.js'
import { userRoutes } from './routes/users.js'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(bodyParser.json())

recipesRoutes(app)
userRoutes(app)

app.get('/', (req, res) => {
  res.send('Hello from Express Live!!')
})

export { app }
