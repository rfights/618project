import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../db/models/user.js'

export async function getUserInfoById(userId) {
  try {
    const user = await User.findById(userId)
    if (!user) return { username: userId }
    return { username: user.username }
  } catch (err) {
    return { username: userId }
  }
}

export async function createUser({ username, password }) {
  if (!username || !password) {
    throw new Error('username and password are required')
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new Error('password must be at least 6 characters')
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  try {
    const user = new User({ username, password: hashedPassword })
    return await user.save()
  } catch (err) {
    // Duplicate key error from MongoDB
    if (err && err.code === 11000) {
      throw new Error('username already exists')
    }
    throw err
  }
}

export async function loginUser({ username, password }) {
  const user = await User.findOne({ username })
  if (!user) throw new Error('invalid username!')

  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    throw new Error('invalid password!')
  }
  const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  })
  return token
}

// Simplified login for development (no JWT)
export async function loginUserSimple({ username, password }) {
  const user = await User.findOne({ username })
  if (!user) throw new Error('invalid username!')

  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    throw new Error('invalid password!')
  }
  return user
}
