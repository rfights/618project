import { initDatabase } from './db/init.js'

import { Recipe } from './db/models/recipe.js'

import dotenv from 'dotenv'
dotenv.config()

await initDatabase()

const recipe = new Recipe({
  title: 'Hello Mongoose!',
  author: '507f1f77bcf86cd799439011', // Mock ObjectId for example
  ingredients: ['1 cup flour', '2 eggs', '1 tsp vanilla'],
  instructions: 'This recipe is stored in a MongoDB database using Mongoose.',
  tags: ['mongoose', 'mongodb'],
})

const createdRecipe = await recipe.save()

await Recipe.findByIdAndUpdate(createdRecipe._id, {
  $set: { title: 'Hello again, Mongoose!' },
})

const recipes = await Recipe.find()
console.log(recipes)
