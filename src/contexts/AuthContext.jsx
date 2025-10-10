import { createContext, useState, useContext } from 'react'
import PropTypes from 'prop-types'

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
})

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthContextProvider.propTypes = {
  children: PropTypes.element.isRequired,
}

export function useAuth() {
  const { user, setUser } = useContext(AuthContext)
  return [user, setUser]
}
