import mongoose, { Schema } from 'mongoose'

const recipeSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    ingredients: [{ type: String, required: true }],
    instructions: { type: String, required: false },
    imageUrl: { type: String, required: false },
    tags: [String],
    likes: [{ type: Schema.Types.ObjectId, ref: 'user', default: [] }],
  },
  { timestamps: true },
)

export const Recipe = mongoose.model('recipe', recipeSchema)
