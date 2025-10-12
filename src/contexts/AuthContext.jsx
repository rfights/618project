import { createContext, useState, useContext, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
})

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  // Rehydrate user from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth:user')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.id &&
          parsed.username
        ) {
          setUser(parsed)
        } else {
          localStorage.removeItem('auth:user')
        }
      }
    } catch (_) {
      // ignore
    }
  }, [])

  // Persist user to localStorage when it changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('auth:user', JSON.stringify(user))
      } else {
        localStorage.removeItem('auth:user')
      }
    } catch (_) {
      // ignore
    }
  }, [user])

  const value = useMemo(() => ({ user, setUser }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthContextProvider.propTypes = {
  children: PropTypes.element.isRequired,
}

export function useAuth() {
  const { user, setUser } = useContext(AuthContext)
  return [user, setUser]
}
