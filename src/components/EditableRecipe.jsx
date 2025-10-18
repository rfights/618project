import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { updateRecipe } from '../api/recipes.js'
import { uploadFile } from '../api/upload.js'
import PropTypes from 'prop-types'

export function EditableRecipe({ recipe, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: recipe.title || '',
    ingredients: recipe.ingredients ? recipe.ingredients.join('\n') : '',
    instructions: recipe.instructions || '',
    imageUrl: recipe.imageUrl || '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imageMode, setImageMode] = useState('url') // 'url' or 'file'
  const [uploading, setUploading] = useState(false)

  const updateRecipeMutation = useMutation({
    mutationFn: async ({ recipeId, updatedRecipe }) => {
      let finalImageUrl = updatedRecipe.imageUrl

      // If user selected file upload mode and has a file, upload it first
      if (imageMode === 'file' && imageFile) {
        setUploading(true)
        try {
          const uploadResponse = await uploadFile(imageFile)
          finalImageUrl = uploadResponse.url
        } catch (uploadError) {
          setUploading(false)
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }
        setUploading(false)
      }

      return updateRecipe(recipeId, {
        ...updatedRecipe,
        imageUrl: finalImageUrl,
      })
    },
    onSuccess: () => {
      setImageFile(null)
      setUploading(false)
      onSave()
    },
    onError: (error) => {
      setUploading(false)
      console.error('Failed to update recipe:', error)
      alert('Failed to update recipe. Please try again.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    const updatedRecipe = {
      title: formData.title.trim(),
      ingredients: formData.ingredients
        .split('\n')
        .map((ingredient) => ingredient.trim())
        .filter((ingredient) => ingredient.length > 0),
      instructions: formData.instructions.trim(),
      imageUrl: formData.imageUrl.trim(),
    }

    if (!updatedRecipe.title) {
      alert('Please enter a recipe title')
      return
    }

    if (updatedRecipe.ingredients.length === 0) {
      alert('Please enter at least one ingredient')
      return
    }

    updateRecipeMutation.mutate({
      recipeId: recipe._id,
      updatedRecipe,
    })
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        e.target.value = '' // Clear the input
        return
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        e.target.value = '' // Clear the input
        return
      }
      setImageFile(file)
    }
  }

  return (
    <div
      style={{
        border: '2px solid #007bff',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
      }}
    >
      <h3>Edit Recipe</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor='edit-title'
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
            }}
          >
            Recipe Title:
          </label>
          <input
            id='edit-title'
            type='text'
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor='edit-ingredients'
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
            }}
          >
            Ingredients (one per line):
          </label>
          <textarea
            id='edit-ingredients'
            value={formData.ingredients}
            onChange={(e) => handleChange('ingredients', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minHeight: '120px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
            placeholder='1 cup flour&#10;2 eggs&#10;1 tsp salt'
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor='edit-instructions'
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
            }}
          >
            Instructions:
          </label>
          <textarea
            id='edit-instructions'
            value={formData.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minHeight: '100px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor='edit-image-url'
            style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: 'bold',
            }}
          >
            Recipe Image (optional):
          </label>

          {/* Image mode selector */}
          <div style={{ marginBottom: '10px' }}>
            <label
              htmlFor='edit-image-url-radio'
              style={{ marginRight: '15px' }}
            >
              <input
                id='edit-image-url-radio'
                type='radio'
                value='url'
                checked={imageMode === 'url'}
                onChange={(e) => setImageMode(e.target.value)}
                style={{ marginRight: '5px' }}
              />
              Use Image URL
            </label>
            <label htmlFor='edit-image-file-radio'>
              <input
                id='edit-image-file-radio'
                type='radio'
                value='file'
                checked={imageMode === 'file'}
                onChange={(e) => setImageMode(e.target.value)}
                style={{ marginRight: '5px' }}
              />
              Upload New Image
            </label>
          </div>

          {/* URL input */}
          {imageMode === 'url' && (
            <input
              type='url'
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder='https://example.com/image.jpg'
            />
          )}

          {/* File input */}
          {imageMode === 'file' && (
            <div>
              <input
                type='file'
                name='edit-image-file'
                id='edit-image-file'
                accept='image/*'
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <div
                style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}
              >
                Accepted formats: JPEG, PNG, GIF, WebP. Max size: 5MB
              </div>
              {imageFile && (
                <div
                  style={{
                    fontSize: '14px',
                    color: '#28a745',
                    marginTop: '5px',
                  }}
                >
                  Selected: {imageFile.name} (
                  {Math.round(imageFile.size / 1024)} KB)
                </div>
              )}
            </div>
          )}

          {/* Show current image if exists */}
          {formData.imageUrl && imageMode === 'url' && (
            <div style={{ marginTop: '10px' }}>
              <div
                style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}
              >
                Current image:
              </div>
              <img
                src={formData.imageUrl}
                alt='Current recipe'
                style={{
                  maxWidth: '200px',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type='submit'
            disabled={updateRecipeMutation.isPending || uploading}
            style={{
              padding: '10px 20px',
              backgroundColor:
                updateRecipeMutation.isPending || uploading
                  ? '#6c757d'
                  : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor:
                updateRecipeMutation.isPending || uploading
                  ? 'not-allowed'
                  : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {uploading
              ? 'Uploading Image...'
              : updateRecipeMutation.isPending
                ? 'Saving...'
                : 'Save Changes'}
          </button>
          <button
            type='button'
            onClick={onCancel}
            disabled={updateRecipeMutation.isPending || uploading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor:
                updateRecipeMutation.isPending || uploading
                  ? 'not-allowed'
                  : 'pointer',
              fontSize: '16px',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

EditableRecipe.propTypes = {
  recipe: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    ingredients: PropTypes.arrayOf(PropTypes.string),
    instructions: PropTypes.string,
    imageUrl: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
