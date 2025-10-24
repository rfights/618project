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
      // Use the same origin to leverage Vite's proxy in development
      const socketUrl = window.location.origin

      console.log('Connecting to socket at:', socketUrl)
      console.log('User attempting connection:', user.username, 'ID:', user.id)

      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['polling', 'websocket'],
        upgrade: true,
        rememberUpgrade: false,
        timeout: 20000,
        forceNew: true,
      })

      // Add more debugging
      console.log('Socket instance created:', !!newSocket)

      newSocket.on('connect', () => {
        console.log('Connected to server:', newSocket.id)
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server')
        setIsConnected(false)
      })

      // Debug log for new recipe events
      newSocket.on('new-recipe', (data) => {
        console.log('Socket received new-recipe event:', data)
      })

      // Test connection event
      newSocket.on('connection-test', (data) => {
        console.log('Socket connection test successful:', data)
      })

      // Test response handler
      newSocket.on('test-response', (data) => {
        console.log('Received test response from server:', data)
        alert(`Server responded: ${data.message}`)
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
  }, [user]) // Removed 'socket' dependency to prevent infinite loop

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
