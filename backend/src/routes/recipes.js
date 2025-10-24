import {
  listAllRecipes,
  listRecipesByAuthor,
  listRecipesByTag,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../services/recipes.js'

export function recipesRoutes(app) {
  app.get('/api/v1/recipes', async (req, res) => {
    const { sortBy, sortOrder, author, tag } = req.query
    const options = {}
    if (sortBy !== undefined) options.sortBy = sortBy
    if (sortOrder !== undefined) options.sortOrder = sortOrder
    try {
      if (author && tag) {
        return res
          .status(400)
          .json({ error: 'query by either author or tag, not both' })
      } else if (author) {
        return res.json(await listRecipesByAuthor(author, options))
      } else if (tag) {
        return res.json(await listRecipesByTag(tag, options))
      } else {
        return res.json(await listAllRecipes(options))
      }
    } catch (err) {
      console.error('error listing recipes', err)
      return res.status(500).end()
    }
  })

  app.get('/api/v1/recipes/:id', async (req, res) => {
    try {
      const recipe = await getRecipeById(req.params.id)
      if (recipe == null) return res.sendStatus(404)
      return res.json(recipe)
    } catch (err) {
      console.error('error getting recipe', err)
      return res.status(500).end()
    }
  })

  app.post('/api/v1/recipes', async (req, res) => {
    try {
      const { authorId } = req.body || {}
      if (!authorId) {
        return res.status(400).json({ error: 'authorId is required' })
      }
      const recipe = await createRecipe(authorId, req.body)

      const io = app.get('io')
      if (io) {
        const populatedRecipe = await recipe.populate('author')
        console.log('Emitting new-recipe event for:', {
          recipeTitle: recipe.title,
          authorId: populatedRecipe.author._id,
          authorUsername: populatedRecipe.author.username,
        })
        io.emit('new-recipe', {
          recipe: populatedRecipe,
          message: `New recipe "${recipe.title}" added by ${populatedRecipe.author.username}!`,
        })
        console.log('Broadcasted new recipe:', recipe.title)
      } else {
        console.log('Socket.IO not available, cannot broadcast new recipe')
      }

      return res.json(recipe)
    } catch (err) {
      console.error('error creating recipe', err)
      return res.status(500).end()
    }
  })

  app.patch('/api/v1/recipes/:id', async (req, res) => {
    try {
      const defaultUserId = '507f1f77bcf86cd799439011'
      const updatedRecipe = await updateRecipe(
        defaultUserId,
        req.params.id,
        req.body,
      )
      return res.json(updatedRecipe)
    } catch (err) {
      console.error('error updating recipe', err)
      return res.status(500).end()
    }
  })

  app.delete('/api/v1/recipes/:id', async (req, res) => {
    try {
      console.log('DELETE /api/v1/recipes/:id query:', req.query)
      const userId = req.query.userId
      if (!userId) return res.status(400).json({ error: 'Missing userId' })
      const { deletedCount } = await deleteRecipe(userId, req.params.id)
      if (deletedCount === 0) return res.sendStatus(404)
      return res.sendStatus(204)
    } catch (err) {
      console.error('error deleting recipe', err)
      return res.status(500).end()
    }
  })

  app.post('/api/v1/recipes/:id/like', async (req, res) => {
    try {
      const userId = req.body.userId
      if (!userId) return res.status(400).json({ error: 'Missing userId' })
      const recipeId = req.params.id
      const result = await req.services.likeRecipe(recipeId, userId)
      if (!result) return res.status(404).json({ error: 'Recipe not found' })
      return res.json(result)
    } catch (err) {
      console.error('error liking recipe', err)
      return res.status(500).end()
    }
  })

  app.post('/api/v1/recipes/:id/unlike', async (req, res) => {
    try {
      const userId = req.body.userId
      if (!userId) return res.status(400).json({ error: 'Missing userId' })
      const recipeId = req.params.id
      const result = await req.services.unlikeRecipe(recipeId, userId)
      if (!result) return res.status(404).json({ error: 'Recipe not found' })
      return res.json(result)
    } catch (err) {
      console.error('error unliking recipe', err)
      return res.status(500).end()
    }
  })
}
