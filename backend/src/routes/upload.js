import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const fileExtension = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension)
  },
})

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ]
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'),
      false,
    )
  }
}

// Configure multer with file size limit (5MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

export function uploadRoutes(app) {
  // Single file upload endpoint
  app.post('/api/v1/upload', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      // Return the file URL that can be used to access the uploaded image
      const fileUrl = `/api/v1/uploads/${req.file.filename}`

      res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      })
    } catch (error) {
      console.error('Upload error:', error)
      res.status(500).json({ error: 'Failed to upload file' })
    }
  })

  // Handle multer errors (file too large, wrong type, etc.)
  app.use('/api/v1/upload', (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res
          .status(400)
          .json({ error: 'File too large. Maximum size is 5MB.' })
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res
          .status(400)
          .json({
            error: 'Unexpected field name. Use "image" as the field name.',
          })
      }
    }
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ error: error.message })
    }
    next(error)
  })
}
