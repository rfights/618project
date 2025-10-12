import {
  createUser,
  loginUserSimple,
  getUserInfoById,
} from '../services/users.js'

export function userRoutes(app) {
  app.post('/api/v1/user/signup', async (req, res) => {
    // Validate request payload early with actionable issues
    const issues = []
    const { username, password } = req.body ?? {}
    if (!username || typeof username !== 'string') {
      issues.push({ field: 'username', message: 'username is required' })
    }
    if (!password || typeof password !== 'string') {
      issues.push({ field: 'password', message: 'password is required' })
    }

    if (issues.length > 0) {
      return res.status(422).json({ error: 'invalid input', issues })
    }

    try {
      const user = await createUser({ username, password })
      return res.status(201).json({ username: user.username })
    } catch (err) {
      console.error('Signup error:', err?.message || err)
      const msg = (err && err.message) || 'unknown error'
      if (/username already exists/i.test(msg)) {
        return res.status(409).json({ error: 'username already exists' })
      }
      if (/required/i.test(msg)) {
        return res.status(400).json({ error: msg })
      }
      return res.status(500).json({
        error: 'failed to create the user',
        details: process.env.NODE_ENV === 'production' ? undefined : msg,
      })
    }
  })
  app.get('/api/v1/users/:id', async (req, res) => {
    try {
      const userInfo = await getUserInfoById(req.params.id)
      return res.status(200).json(userInfo)
    } catch (err) {
      return res.status(404).json({ error: 'User not found' })
    }
  })

  app.post('/api/v1/user/login', async (req, res) => {
    try {
      const token = await loginUserSimple(req.body)
      return res.status(200).send({ token })
    } catch (err) {
      return res.status(400).send({
        error: 'login failed, did you enter the correct username/password?',
      })
    }
  })

  // Debug endpoint to list all users (development only)
  app.get('/api/v1/users/debug/list', async (req, res) => {
    try {
      const { User } = await import('../db/models/user.js')
      const users = await User.find({}, 'username createdAt')
      return res.status(200).json({
        count: users.length,
        users: users,
      })
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch users', details: err.message })
    }
  })
}
