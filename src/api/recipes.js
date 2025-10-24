import { BASE } from './client'

export const getRecipes = async (queryParams) => {
  const res = await fetch(`${BASE}/recipes?` + new URLSearchParams(queryParams))
  return await res.json()
}

export const getRecipe = async (recipeId) => {
  const res = await fetch(`${BASE}/recipes/${recipeId}`)
  return await res.json()
}

export const createRecipe = async (recipe) => {
  const res = await fetch(`${BASE}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recipe),
  })
  return await res.json()
}

export const updateRecipe = async (recipeId, recipe) => {
  const res = await fetch(`${BASE}/recipes/${recipeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recipe),
  })
  return await res.json()
}

export const deleteRecipe = async (recipeId, userId) => {
  const res = await fetch(
    `${BASE}/recipes/${recipeId}?userId=${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return res
}

export const likeRecipe = async (recipeId, userId) => {
  const res = await fetch(`${BASE}/recipes/${recipeId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  })
  return await res.json()
}

export const unlikeRecipe = async (recipeId, userId) => {
  const res = await fetch(`${BASE}/recipes/${recipeId}/unlike`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  })
  return await res.json()
}
