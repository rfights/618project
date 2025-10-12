import {
  listAllRecipes,
  listRecipesByAuthor,
  listRecipesByTag,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../services/recipes.js'

// Removed JWT authentication for development simplicity

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
      return res.json(recipe)
    } catch (err) {
      console.error('error creating recipe', err)
      return res.status(500).end()
    }
  })

  app.patch('/api/v1/recipes/:id', async (req, res) => {
    try {
      // Use a default user ID for development (no auth required)
      const defaultUserId = '507f1f77bcf86cd799439011' // Mock ObjectId
      const recipe = await updateRecipe(defaultUserId, req.params.id, req.body)
      return res.json(recipe)
    } catch (err) {
      console.error('error updating recipe', err)
      return res.status(500).end()
    }
  })

  app.delete('/api/v1/recipes/:id', async (req, res) => {
    try {
      // Use a default user ID for development (no auth required)
      const defaultUserId = '507f1f77bcf86cd799439011' // Mock ObjectId
      const { deletedCount } = await deleteRecipe(defaultUserId, req.params.id)
      if (deletedCount === 0) return res.sendStatus(404)
      return res.sendStatus(204)
    } catch (err) {
      console.error('error deleting recipe', err)
      return res.status(500).end()
    }
  })
}
