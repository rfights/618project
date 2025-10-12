import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../api/users.js'

export function Signup() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const signupMutation = useMutation({
    mutationFn: () => signup({ username, password }),
    onSuccess: () => navigate('/login'),
    onError: (err) => {
      // Keep state-driven error display; avoid alert noise
      console.error('Signup failed:', err)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    signupMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Link to='/'>Back to main page</Link>
      <hr />
      <div>
        <label htmlFor='create-username'>Username: </label>
        <input
          type='text'
          name='create-username'
          id='create-username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <br />
      <div>
        <label htmlFor='create-password'>Password: </label>
        <input
          type='password'
          name='create-password'
          id='create-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <br />
      <input
        type='submit'
        value={signupMutation.isPending ? 'Signing up...' : 'Sign Up'}
        disabled={!username || !password || signupMutation.isPending}
      />
      {signupMutation.isError && (
        <div style={{ color: 'red' }}>
          <strong>Failed to sign up.</strong>
          <div>
            {(() => {
              const raw = signupMutation.error?.message || ''
              // If backend provided structured error via thrown Error(message)
              try {
                const maybe = JSON.parse(raw)
                if (maybe && maybe.error) {
                  return (
                    <>
                      <div>{maybe.error}</div>
                      {Array.isArray(maybe.issues) &&
                        maybe.issues.length > 0 && (
                          <ul>
                            {maybe.issues.map((i, idx) => (
                              <li key={idx}>
                                {i.field ? `${i.field}: ` : ''}
                                {i.message}
                              </li>
                            ))}
                          </ul>
                        )}
                    </>
                  )
                }
              } catch (_) {
                // not JSON, fall through
              }

              // Fallback: show plain message and useful hints
              return (
                <>
                  <div>{raw || 'Unknown error'}</div>
                  {raw.toLowerCase().includes('failed to fetch') && (
                    <div>
                      Hint: check that your backend is reachable over HTTPS and
                      that ports are forwarded (Codespaces). Try reloading the
                      page.
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}
    </form>
  )
}
