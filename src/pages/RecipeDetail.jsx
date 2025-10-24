import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRecipe } from '../api/recipes.js'
import { Recipe } from '../components/Recipe.jsx'
import { Header } from '../components/Header.jsx'

export function RecipeDetail() {
  const { recipeId } = useParams()

  const recipeQuery = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => getRecipe(recipeId),
  })

  if (recipeQuery.isLoading) {
    return (
      <div style={{ padding: 8 }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading recipe...
        </div>
      </div>
    )
  }

  if (recipeQuery.isError) {
    return (
      <div style={{ padding: 8 }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          Error loading recipe: {recipeQuery.error?.message || 'Unknown error'}
        </div>
      </div>
    )
  }

  const recipe = recipeQuery.data

  if (!recipe) {
    return (
      <div style={{ padding: 8 }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Recipe not found
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 8 }}>
      <Header />
      <br />
      <hr />
      <br />
      <Recipe {...recipe} recipeId={recipe._id} showActions={false} />
    </div>
  )
}
