import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export function RecipeNotification() {
  const [notification, setNotification] = useState(null)
  const { socket } = useSocket()
  const [user] = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (socket && user) {
      const handleNewRecipe = (data) => {
        // Don't show notification for own recipes
        if (data.recipe.author._id !== user.id) {
          setNotification(data)
          // Auto-hide after 10 seconds
          setTimeout(() => {
            setNotification(null)
          }, 10000)
        }
      }

      socket.on('new-recipe', handleNewRecipe)

      return () => {
        socket.off('new-recipe', handleNewRecipe)
      }
    }
  }, [socket, user])

  const handleViewRecipe = () => {
    if (notification?.recipe) {
      // Navigate directly to the newly added recipe page
      navigate(`/recipe/${notification.recipe._id}`)
      setNotification(null)
    }
  }

  const handleDismiss = () => {
    setNotification(null)
  }

  if (!notification) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#4caf50',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        maxWidth: '350px',
        minWidth: '250px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1, marginRight: '10px' }}>
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '16px',
              marginBottom: '8px',
            }}
          >
            🍳 New Recipe Added!
          </div>
          <div style={{ fontSize: '14px', marginBottom: '12px' }}>
            {notification.message}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleViewRecipe}
              style={{
                backgroundColor: 'white',
                color: '#4caf50',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              View Recipe
            </button>
            <button
              onClick={handleDismiss}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid white',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1',
          }}
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
