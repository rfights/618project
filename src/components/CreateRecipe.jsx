import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createRecipe } from '../api/recipes.js'
import { uploadFile } from '../api/upload.js'
import { useAuth } from '../contexts/AuthContext.jsx'

export function CreateRecipe() {
  const [user] = useAuth()
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imageMode, setImageMode] = useState('url') // 'url' or 'file'
  const [uploading, setUploading] = useState(false)

  const queryClient = useQueryClient()

  const createRecipeMutation = useMutation({
    mutationFn: async () => {
      const ingredientsArray = ingredients
        .split('\n')
        .map((ingredient) => ingredient.trim())
        .filter((ingredient) => ingredient.length > 0)

      let finalImageUrl = ''

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
      } else if (imageMode === 'url' && imageUrl.trim()) {
        finalImageUrl = imageUrl.trim()
      }

      return createRecipe({
        authorId: user?.id,
        title,
        ingredients: ingredientsArray,
        instructions,
        imageUrl: finalImageUrl || undefined,
      })
    },
    onSuccess: () => {
      // Invalidate all recipe queries so lists refresh (React Query v5 API)
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      // Clear form after successful creation
      setTitle('')
      setIngredients('')
      setInstructions('')
      setImageUrl('')
      setImageFile(null)
      setUploading(false)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createRecipeMutation.mutate()
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

  if (!user) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
          Please log in to post recipes!
        </p>
        <p style={{ color: '#6c757d' }}>
          Sign up for a new account or log in to post and like recipes.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor='create-title'>Recipe Title: </label>
        <input
          type='text'
          name='create-title'
          id='create-title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor='create-ingredients'>Ingredients: </label>
        <textarea
          name='create-ingredients'
          id='create-ingredients'
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={6}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor='create-instructions'>Instructions: </label>
        <textarea
          name='create-instructions'
          id='create-instructions'
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label
          htmlFor='create-image-url'
          style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}
        >
          Recipe Image (optional):
        </label>

        {/* Image mode selector */}
        <div style={{ marginBottom: '10px' }}>
          <label
            htmlFor='create-image-url-radio'
            style={{ marginRight: '15px' }}
          >
            <input
              id='create-image-url-radio'
              type='radio'
              value='url'
              checked={imageMode === 'url'}
              onChange={(e) => setImageMode(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            Use Image URL
          </label>
          <label htmlFor='create-image-file-radio'>
            <input
              id='create-image-file-radio'
              type='radio'
              value='file'
              checked={imageMode === 'file'}
              onChange={(e) => setImageMode(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            Upload Image File
          </label>
        </div>

        {/* URL input */}
        {imageMode === 'url' && (
          <input
            type='url'
            name='create-image-url'
            id='create-image-url'
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder='https://example.com/recipe-image.jpg'
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        )}

        {/* File input */}
        {imageMode === 'file' && (
          <div>
            <input
              type='file'
              name='create-image-file'
              id='create-image-file'
              accept='image/*'
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Accepted formats: JPEG, PNG, GIF, WebP. Max size: 5MB
            </div>
            {imageFile && (
              <div
                style={{ fontSize: '14px', color: '#28a745', marginTop: '5px' }}
              >
                Selected: {imageFile.name} ({Math.round(imageFile.size / 1024)}{' '}
                KB)
              </div>
            )}
          </div>
        )}
      </div>

      <input
        type='submit'
        value={
          uploading
            ? 'Uploading Image...'
            : createRecipeMutation.isPending
              ? 'Creating...'
              : 'Create Recipe'
        }
        disabled={
          !title || !ingredients || createRecipeMutation.isPending || uploading
        }
        style={{
          padding: '10px 20px',
          backgroundColor:
            !title ||
            !ingredients ||
            createRecipeMutation.isPending ||
            uploading
              ? '#6c757d'
              : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor:
            !title ||
            !ingredients ||
            createRecipeMutation.isPending ||
            uploading
              ? 'not-allowed'
              : 'pointer',
        }}
      />

      {createRecipeMutation.isSuccess && (
        <>
          <br />
          <span style={{ color: 'green', marginTop: '10px', display: 'block' }}>
            Recipe created successfully!
          </span>
        </>
      )}

      {createRecipeMutation.isError && (
        <>
          <br />
          <span style={{ color: 'red', marginTop: '10px', display: 'block' }}>
            Failed to create recipe. Please try again.
          </span>
        </>
      )}
    </form>
  )
}
