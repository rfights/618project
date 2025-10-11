import { BASE } from './client'

export const signup = async ({ username, password }) => {
  const url = `${BASE}/user/signup`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    let message = 'failed to register'
    try {
      const data = await res.json()
      if (data?.error) message = data.error
      if (data?.details) message += `: ${data.details}`
    } catch (_) {
      // ignore parse error
    }
    throw new Error(message)
  }
  return await res.json()
}

export const login = async ({ username, password }) => {
  const res = await fetch(`${BASE}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('failed to login')
  return await res.json()
}

export const getUserInfo = async (id) => {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error('failed to fetch user info')
  return await res.json()
}
