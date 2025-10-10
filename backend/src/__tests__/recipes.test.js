import mongoose from 'mongoose'
import { describe, expect, test, beforeEach, beforeAll } from '@jest/globals'
import {
  createRecipe,
  listAllRecipes,
  listRecipesByAuthor,
  listRecipesByTag,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from '../services/recipes.js'
import { Recipe } from '../db/models/recipe.js'

import { createUser } from '../services/users.js'

let testUser = null
let sampleRecipes = []

beforeAll(async () => {
  testUser = await createUser({ username: 'sampleChef', password: 'user' })
  sampleRecipes = [
    { 
      title: 'Classic Pasta Carbonara', 
      author: testUser._id, 
      ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese', 'black pepper'],
      instructions: 'Cook pasta, whisk eggs with cheese, combine with hot pasta and bacon.',
      imageUrl: 'https://example.com/carbonara.jpg',
      tags: ['italian', 'pasta'] 
    },
    { 
      title: 'Chocolate Chip Cookies', 
      author: testUser._id, 
      ingredients: ['flour', 'butter', 'sugar', 'chocolate chips', 'eggs'],
      instructions: 'Mix ingredients, form cookies, bake at 350F for 12 minutes.',
      tags: ['dessert', 'cookies'] 
    },
    {
      title: 'Garden Salad',
      author: testUser._id,
      ingredients: ['lettuce', 'tomatoes', 'cucumbers', 'olive oil', 'vinegar'],
      instructions: 'Chop vegetables, drizzle with oil and vinegar.',
      tags: ['healthy', 'salad'],
    },
  ]
})

let createdSampleRecipes = []
beforeEach(async () => {
  await Recipe.deleteMany({})
  createdSampleRecipes = []
  for (const recipe of sampleRecipes) {
    const createdRecipe = new Recipe(recipe)
    createdSampleRecipes.push(await createdRecipe.save())
  }
})

describe('getting a recipe', () => {
  test('should return the full recipe', async () => {
    const recipe = await getRecipeById(createdSampleRecipes[0]._id)
    expect(recipe.toObject()).toEqual(createdSampleRecipes[0].toObject())
  })
  test('should fail if the id does not exist', async () => {
    const recipe = await getRecipeById('000000000000000000000000')
    expect(recipe).toEqual(null)
  })
})

describe('listing recipes', () => {
  test('should return all recipes', async () => {
    const recipes = await listAllRecipes()
    expect(recipes.length).toEqual(createdSampleRecipes.length)
  })
  test('should be able to filter recipes by tag', async () => {
    const recipes = await listRecipesByTag('italian')
    expect(recipes.length).toBe(1)
  })
  test('should be able to filter recipes by author', async () => {
    const recipes = await listRecipesByAuthor(testUser.username)
    expect(recipes.length).toBe(3)
  })
  test('should return recipes sorted by creation date descending by default', async () => {
    const recipes = await listAllRecipes()
    const sortedSampleRecipes = createdSampleRecipes.sort(
      (a, b) => b.createdAt - a.createdAt,
    )
    expect(recipes.map((recipe) => recipe.createdAt)).toEqual(
      sortedSampleRecipes.map((recipe) => recipe.createdAt),
    )
  })
  test('should take into account provided sorting options', async () => {
    const recipes = await listAllRecipes({
      sortBy: 'updatedAt',
      sortOrder: 'ascending',
    })
    const sortedSampleRecipes = createdSampleRecipes.sort(
      (a, b) => a.updatedAt - b.updatedAt,
    )
    expect(recipes.map((recipe) => recipe.updatedAt)).toEqual(
      sortedSampleRecipes.map((recipe) => recipe.updatedAt),
    )
  })
})

describe('creating recipes', () => {
  test('with all parameters should succeed', async () => {
    const recipe = {
      title: 'Test Recipe',
      ingredients: ['ingredient1', 'ingredient2'],
      instructions: 'Test instructions for cooking.',
      imageUrl: 'https://example.com/test-recipe.jpg',
      tags: ['test', 'recipe'],
    }
    const createdRecipe = await createRecipe(testUser._id, recipe)
    expect(createdRecipe._id).toBeInstanceOf(mongoose.Types.ObjectId)
    const foundRecipe = await Recipe.findById(createdRecipe._id)
    expect(foundRecipe).toEqual(expect.objectContaining(recipe))
    expect(foundRecipe.createdAt).toBeInstanceOf(Date)
    expect(foundRecipe.updatedAt).toBeInstanceOf(Date)
  })

  test('without title should fail', async () => {
    const recipe = {
      ingredients: ['ingredient1'],
      instructions: 'Recipe with no title',
      tags: ['test'],
    }
    try {
      await createRecipe(testUser._id, recipe)
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.message).toContain('`title` is required')
    }
  })

  test('with minimal parameters should succeed', async () => {
    const recipe = {
      title: 'Minimal Recipe',
      ingredients: ['simple ingredient']
    }
    const createdRecipe = await createRecipe(testUser._id, recipe)
    expect(createdRecipe._id).toBeInstanceOf(mongoose.Types.ObjectId)
  })
})

describe('updating recipes', () => {
  test('should update the specified property', async () => {
    await updateRecipe(testUser._id, createdSampleRecipes[0]._id, {
      instructions: 'Updated cooking instructions',
    })
    const updatedRecipe = await Recipe.findById(createdSampleRecipes[0]._id)
    expect(updatedRecipe.instructions).toEqual('Updated cooking instructions')
  })

  test('should not update other properties', async () => {
    await updateRecipe(testUser._id, createdSampleRecipes[0]._id, {
      instructions: 'Updated instructions',
    })
    const updatedRecipe = await Recipe.findById(createdSampleRecipes[0]._id)
    expect(updatedRecipe.title).toEqual('Classic Pasta Carbonara')
  })

  test('should update the updatedAt timestamp', async () => {
    await updateRecipe(testUser._id, createdSampleRecipes[0]._id, {})
    const updatedRecipe = await Recipe.findById(createdSampleRecipes[0]._id)
    expect(updatedRecipe.updatedAt.getTime()).toBeGreaterThan(
      createdSampleRecipes[0].updatedAt.getTime(),
    )
  })

  test('should fail if the id does not exist', async () => {
    const recipe = await updateRecipe(testUser._id, '000000000000000000000000', {})
    expect(recipe).toEqual(null)
  })
})

describe('deleting recipes', () => {
  test('should remove the recipe from the database', async () => {
    const result = await deleteRecipe(testUser._id, createdSampleRecipes[0]._id)
    expect(result.deletedCount).toEqual(1)
    const deletedRecipe = await Recipe.findById(createdSampleRecipes[0]._id)
    expect(deletedRecipe).toEqual(null)
  })

  test('should fail if the id does not exist', async () => {
    const result = await deleteRecipe('000000000000000000000000')
    expect(result.deletedCount).toEqual(0)
  })
})