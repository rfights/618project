import { Recipe } from '../db/models/recipe.js'
import { User } from '../db/models/user.js'

export async function createRecipe(
  userID,
  { title, ingredients, instructions, imageUrl, tags },
) {
  const recipe = new Recipe({
    title,
    author: userID,
    ingredients,
    instructions,
    imageUrl,
    tags,
  })
  return await recipe.save()
}

async function listRecipes(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {},
) {
  try {
    const count = await Recipe.countDocuments(query)
    if (count === 0) {
      return []
    }
    const mongoSortOrder = sortOrder === 'ascending' ? 1 : -1
    if (sortBy === 'likes') {
      const recipes = await Recipe.aggregate([
        { $match: query },
        { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
        { $sort: { likesCount: mongoSortOrder } },
      ])
      const populated = await Recipe.populate(recipes, { path: 'author' })
      return populated
    }
    return await Recipe.find(query).sort({ [sortBy]: mongoSortOrder })
  } catch (error) {
    console.error('Error in listRecipes:', error)
    return []
  }
}

export async function listAllRecipes(options) {
  try {
    return await listRecipes({}, options)
  } catch (error) {
    console.error('Error in listAllRecipes:', error)
    return []
  }
}

export async function listRecipesByAuthor(authorUsername, options) {
  try {
    if (!authorUsername || authorUsername.trim() === '') {
      return []
    }

    const user = await User.findOne({ username: authorUsername })
    if (!user) return []

    return await listRecipes({ author: user._id }, options)
  } catch (error) {
    console.error('Error in listRecipesByAuthor:', error)
    return []
  }
}

export async function listRecipesByTag(tags, options) {
  try {
    if (!tags) {
      return []
    }

    return await listRecipes({ tags }, options)
  } catch (error) {
    console.error('Error in listRecipesByTag:', error)
    return []
  }
}

export async function getRecipeById(recipeId) {
  return await Recipe.findById(recipeId)
}

export async function updateRecipe(
  userId,
  recipeId,
  { title, ingredients, instructions, imageUrl, tags },
) {
  return await Recipe.findOneAndUpdate(
    { _id: recipeId, author: userId },
    { $set: { title, ingredients, instructions, imageUrl, tags } },
    { new: true },
  )
}

export async function deleteRecipe(userId, recipeId) {
  return await Recipe.deleteOne({ _id: recipeId, author: userId })
}

// Like a recipe
export async function likeRecipe(recipeId, userId) {
  const recipe = await Recipe.findById(recipeId)
  if (!recipe) return null
  // Prevent author from liking their own recipe
  const authorId = recipe.author.toString()
  const userIdStr = userId.toString()
  if (authorId === userIdStr) {
    return recipe
  }
  // Only allow one like per user, and only if not already liked
  const likeIds = recipe.likes.map((id) => id.toString())
  if (!likeIds.includes(userIdStr)) {
    recipe.likes.push(userIdStr)
    await recipe.save()
  }
  // Always return likes as strings
  recipe.likes = recipe.likes.map((id) => id.toString())
  return recipe
}

export async function unlikeRecipe(recipeId, userId) {
  const recipe = await Recipe.findById(recipeId)
  if (!recipe) return null
  const authorId = recipe.author.toString()
  const userIdStr = userId.toString()
  if (authorId === userIdStr) {
    return recipe
  }
  recipe.likes = recipe.likes
    .map((id) => id.toString())
    .filter((id) => id !== userIdStr)
  await recipe.save()
  // Always return likes as strings
  recipe.likes = recipe.likes.map((id) => id.toString())
  return recipe
}
