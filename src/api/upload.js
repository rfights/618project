import { BASE } from './client'

/**
 * Upload an image file to the server
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Upload response with file URL
 */
export const uploadFile = async (file) => {
  // Create FormData object for multipart/form-data
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    body: formData, // Don't set Content-Type header, let browser set it with boundary
  })

  if (!res.ok) {
    let errorMessage = 'Failed to upload file'
    try {
      const errorData = await res.json()
      errorMessage = errorData.error || errorMessage
    } catch (_) {
      // Failed to parse error response, use default message
    }
    throw new Error(errorMessage)
  }

  return await res.json()
}
