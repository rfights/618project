import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import PropTypes from 'prop-types'
import { useAuth } from './AuthContext.jsx'

const SocketContext = createContext({
  socket: null,
  isConnected: false,
})

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [user] = useAuth()

  useEffect(() => {
    // Only connect if user is logged in
    if (user) {
      // Connect to the same host/port as the backend API
      const socketUrl = import.meta.env.DEV
        ? 'http://localhost:3001'
        : window.location.origin

      console.log('Connecting to socket at:', socketUrl)
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        console.log('Connected to server:', newSocket.id)
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        console.log('Cleaning up socket connection')
        newSocket.close()
        setSocket(null)
        setIsConnected(false)
      }
    } else {
      // Disconnect if user logs out
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [user, socket])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
