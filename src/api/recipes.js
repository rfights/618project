export const getRecipes = async (queryParams) => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/recipes?` +
      new URLSearchParams(queryParams),
  )
  return await res.json()
}

export const createRecipe = async (token, recipe) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(recipe),
  })
  return await res.json()
}

export const updateRecipe = async (token, recipeId, recipe) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recipes/${recipeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(recipe),
  })
  return await res.json()
}

export const deleteRecipe = async (token, recipeId) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return res
}