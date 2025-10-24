import { RecipeList } from '../components/RecipeList.jsx'
import { CreateRecipe } from '../components/CreateRecipe.jsx'
import { RecipeFilter } from '../components/RecipeFilter.jsx'
import { RecipeSorting } from '../components/RecipeSort.jsx'
import { EditableRecipe } from '../components/EditableRecipe.jsx'

import { Header } from '../components/Header.jsx'

import { useState, useCallback } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRecipes, deleteRecipe } from '../api/recipes.js'
import { useSocket } from '../contexts/SocketContext.jsx'
export function Recipes() {
  const [author, setAuthor] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('descending')
  const [editingRecipe, setEditingRecipe] = useState(null)

  // const [user] = useAuth()
  const queryClient = useQueryClient()
  const { isConnected } = useSocket()

  const recipesQuery = useQuery({
    queryKey: ['recipes', { author, sortBy, sortOrder }],
    queryFn: () => getRecipes({ author, sortBy, sortOrder }),
  })

  const deleteRecipeMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })

  const recipes = recipesQuery.data ?? []

  const handleEdit = useCallback(
    (recipeId) => {
      const recipe = recipes.find((r) => r._id === recipeId)
      if (recipe) {
        setEditingRecipe(recipe)
      }
    },
    [recipes],
  )

  const handleDelete = useCallback(
    async (recipeId) => {
      if (window.confirm('Are you sure you want to delete this recipe?')) {
        deleteRecipeMutation.mutate(recipeId)
      }
    },
    [deleteRecipeMutation],
  )

  const handleCancelEdit = useCallback(() => {
    setEditingRecipe(null)
  }, [])

  const handleSaveEdit = useCallback(() => {
    setEditingRecipe(null)
    queryClient.invalidateQueries({ queryKey: ['recipes'] })
  }, [queryClient])

  return (
    <div style={{ padding: 8 }}>
      <Header />
      <br />
      <hr />
      <br />
      {/* Socket connection status */}
      <div
        style={{
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
        }}
      >
        <strong>Socket Status:</strong>
        <span
          style={{
            color: isConnected ? 'green' : 'red',
            fontWeight: 'bold',
            marginLeft: '10px',
          }}
        >
          {isConnected ? '✅ Connected' : '❌ Disconnected'}
        </span>
      </div>
      <CreateRecipe />
      <br />
      <hr />
      {editingRecipe && (
        <div style={{ marginBottom: 20 }}>
          <EditableRecipe
            recipe={editingRecipe}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
          <hr />
        </div>
      )}
      Filter by:
      <RecipeFilter
        field='author'
        value={author}
        onChange={(value) => setAuthor(value)}
      />
      <br />
      <RecipeSorting
        fields={['createdAt', 'updatedAt', 'likes']}
        value={sortBy}
        onChange={(value) => setSortBy(value)}
        orderValue={sortOrder}
        onOrderChange={(orderValue) => setSortOrder(orderValue)}
      />
      <hr />
      <RecipeList
        recipes={recipes}
        showActions={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
