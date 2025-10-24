import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

export function RecipeNotification() {
  const [notification, setNotification] = useState(null)
  const { socket, isConnected } = useSocket()
  const [user] = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (socket && user) {
      const handleNewRecipe = (data) => {
        console.log('Received new-recipe event:', {
          recipeAuthorId: data.recipe.author._id,
          currentUserId: user.id,
          recipeTitle: data.recipe.title,
          message: data.message,
        })

        // Convert IDs to strings for comparison to handle ObjectId vs string differences
        const authorId = data.recipe.author._id?.toString()
        const currentUserId = user.id?.toString()

        if (authorId !== currentUserId) {
          console.log('Showing notification for new recipe:', data.recipe.title)
          setNotification(data)
          // Invalidate queries to refresh the recipe list immediately
          queryClient.invalidateQueries({ queryKey: ['recipes'] })
          setTimeout(() => {
            setNotification(null)
          }, 10000)
        } else {
          console.log(
            'Not showing notification - recipe created by current user',
          )
        }
      }

      socket.on('new-recipe', handleNewRecipe)

      return () => {
        socket.off('new-recipe', handleNewRecipe)
      }
    }
  }, [socket, user, queryClient])

  const handleViewRecipe = () => {
    if (notification?.recipe) {
      navigate(`/recipe/${notification.recipe._id}`)
      setNotification(null)
    }
  }

  const handleDismiss = () => {
    setNotification(null)
  }

  if (!notification) {
    // Show connection status for debugging (only when logged in)
    if (user) {
      return (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: isConnected ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 999,
          }}
        >
          Socket: {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      )
    }
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#ff40ffff',
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
            Someone added a new recipe!
          </div>
          <div style={{ fontSize: '14px', marginBottom: '12px' }}>
            {notification.message}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleViewRecipe}
              style={{
                backgroundColor: 'white',
                color: '#ff40ffff',
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
