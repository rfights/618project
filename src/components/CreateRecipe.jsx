import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createRecipe } from '../api/recipes.js'
import { useAuth } from '../contexts/AuthContext.jsx'

export function CreateRecipe() {
  const [user] = useAuth()
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const queryClient = useQueryClient()

  const createRecipeMutation = useMutation({
    mutationFn: () => {
      const ingredientsArray = ingredients
        .split('\n')
        .map((ingredient) => ingredient.trim())
        .filter((ingredient) => ingredient.length > 0)

      return createRecipe({
        authorId: user?.id,
        title,
        ingredients: ingredientsArray,
        instructions,
        imageUrl: imageUrl.trim() || undefined,
      })
    },
    onSuccess: () => {
      // Invalidate all recipe queries so lists refresh (React Query v5 API)
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      // Clear form after successful creation
      setTitle('')
      setIngredients('')
      setInstructions('')
      setImageUrl('')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createRecipeMutation.mutate()
  }

  if (!user) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
          Please log in to post recipes!
        </p>
        <p style={{ color: '#6c757d' }}>
          Sign up for a new account or log in to post and like recipes.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor='create-title'>Recipe Title: </label>
        <input
          type='text'
          name='create-title'
          id='create-title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor='create-ingredients'>Ingredients: </label>
        <textarea
          name='create-ingredients'
          id='create-ingredients'
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={6}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor='create-instructions'>Instructions: </label>
        <textarea
          name='create-instructions'
          id='create-instructions'
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder='Describe the cooking steps...'
          rows={4}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor='create-image-url'>Image URL (optional): </label>
        <input
          type='url'
          name='create-image-url'
          id='create-image-url'
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder='https://example.com/recipe-image.jpg'
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <input
        type='submit'
        value={createRecipeMutation.isPending ? 'Creating...' : 'Create Recipe'}
        disabled={!title || !ingredients || createRecipeMutation.isPending}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      />

      {createRecipeMutation.isSuccess && (
        <>
          <br />
          <span style={{ color: 'green', marginTop: '10px', display: 'block' }}>
            Recipe created successfully!
          </span>
        </>
      )}

      {createRecipeMutation.isError && (
        <>
          <br />
          <span style={{ color: 'red', marginTop: '10px', display: 'block' }}>
            Failed to create recipe. Please try again.
          </span>
        </>
      )}
    </form>
  )
}
