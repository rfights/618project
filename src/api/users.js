export const signup = async ({ username, password }) => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/user/signup`
  console.log('Signup URL:', url)
  console.log('Environment variable:', import.meta.env.VITE_BACKEND_URL)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  console.log('Response status:', res.status)
  console.log('Response ok:', res.ok)

  if (!res.ok) {
    const errorText = await res.text()
    console.log('Error response:', errorText)
    throw new Error('failed to sign up')
  }
  return await res.json()
}

export const login = async ({ username, password }) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('failed to login')
  return await res.json()
}

export const getUserInfo = async (id) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error('failed to fetch user info')
  return await res.json()
}
