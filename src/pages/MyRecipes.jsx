import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRecipes, deleteRecipe } from '../api/recipes.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Header } from '../components/Header.jsx'
import { EditableRecipe } from '../components/EditableRecipe.jsx'

export function MyRecipes() {
  const [user] = useAuth()
  const queryClient = useQueryClient()
  const [editingRecipe, setEditingRecipe] = useState(null)

  // Get recipes by current user
  const recipesQuery = useQuery({
    queryKey: ['recipes', { author: user?.username }],
    queryFn: () => getRecipes({ author: user?.username }),
    enabled: !!user?.username,
  })

  const deleteRecipeMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })

  const recipes = recipesQuery.data ?? []

  if (!user) {
    return (
      <div style={{ padding: 8 }}>
        <Header />
        <p>Please log in to view your recipes.</p>
      </div>
    )
  }

  const handleDelete = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipeMutation.mutate(recipeId)
    }
  }

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe)
  }

  const handleCancelEdit = () => {
    setEditingRecipe(null)
  }

  const handleSaveEdit = () => {
    setEditingRecipe(null)
    queryClient.invalidateQueries({ queryKey: ['recipes'] })
  }

  return (
    <div style={{ padding: 8 }}>
      <Header />
      <br />
      <h2>My Recipes ({recipes.length})</h2>
      <hr />
      <br />

      {editingRecipe && (
        <div style={{ marginBottom: 20 }}>
          <EditableRecipe
            recipe={editingRecipe}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {recipes.length === 0 ? (
        <p>
          You haven&apos;t created any recipes yet. Visit the main page to
          create your first recipe!
        </p>
      ) : (
        <div>
          {recipes.map((recipe) => (
            <article
              key={recipe._id}
              style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background:
                  editingRecipe?._id === recipe._id ? '#f0f0f0' : 'white',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '10px',
                }}
              >
                <h3 style={{ margin: 0 }}>{recipe.title}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(recipe)}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    disabled={editingRecipe !== null}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(recipe._id)}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    disabled={deleteRecipeMutation.isPending}
                  >
                    {deleteRecipeMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              {recipe.imageUrl && (
                <div style={{ marginBottom: '15px' }}>
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    style={{
                      maxWidth: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '5px',
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <h4>Ingredients:</h4>
                <ul>
                  {recipe.ingredients &&
                    recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                </ul>
              </div>

              {recipe.instructions && (
                <div style={{ marginBottom: '15px' }}>
                  <h4>Instructions:</h4>
                  <p>{recipe.instructions}</p>
                </div>
              )}

              <div style={{ fontSize: '12px', color: '#666' }}>
                <p>
                  Created: {new Date(recipe.createdAt).toLocaleDateString()}
                </p>
                {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
                  <p>
                    Last updated:{' '}
                    {new Date(recipe.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
