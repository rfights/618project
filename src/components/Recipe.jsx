import PropTypes from 'prop-types'
import { User } from './User.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useState } from 'react'
import { likeRecipe, unlikeRecipe } from '../api/recipes.js'

export function Recipe({
  title,
  ingredients,
  instructions,
  imageUrl,
  author,
  recipeId,
  onEdit,
  onDelete,
  showActions = false,
  likes = [],
}) {
  const [user] = useAuth()
  const [likeList, setLikeList] = useState(likes)
  const isOwner =
    user &&
    ((typeof author === 'string' && author === user.username) ||
      author?.username === user.username ||
      author?._id === user.id)
  const userId = user?.id
  const hasLiked =
    userId && likeList.some((id) => id === userId || id?._id === userId)

  const handleLike = async () => {
    if (!userId) return
    if (hasLiked) {
      const updated = await unlikeRecipe(recipeId)
      setLikeList(updated.likes)
    } else {
      const updated = await likeRecipe(recipeId)
      setLikeList(updated.likes)
    }
  }

  return (
    <article
      style={{
        marginBottom: '20px',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: '10px',
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        {showActions && isOwner && (onEdit || onDelete) && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button
                onClick={() => onEdit(recipeId)}
                style={{
                  padding: '5px 12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(recipeId)}
                style={{
                  padding: '5px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Like button and count */}
      <div
        style={{
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          onClick={handleLike}
          disabled={!userId}
          style={{
            background: hasLiked ? '#ff4081' : '#eee',
            color: hasLiked ? 'white' : '#333',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '18px',
            cursor: userId ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
          title={userId ? (hasLiked ? 'Unlike' : 'Like') : 'Login to like'}
        >
          <img
            src='/src/assets/meow_chefkiss.png'
            alt='Like'
            style={{ width: '20px', height: '20px' }}
          />
        </button>
        <span>
          {likeList.length} {likeList.length === 1 ? 'like' : 'likes'}
        </span>
      </div>

      {imageUrl && (
        <div style={{ marginBottom: '15px' }}>
          <img
            src={imageUrl}
            alt={title}
            style={{
              maxWidth: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '5px',
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <h4>Ingredients:</h4>
        <ul>
          {ingredients &&
            ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
        </ul>
      </div>

      {instructions && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Instructions:</h4>
          <p>{instructions}</p>
        </div>
      )}

      {author && (
        <em>
          <br />
          {typeof author === 'string' ? (
            <>
              Recipe by <User id={author} />
            </>
          ) : author?.username ? (
            <>
              Recipe by <strong>{author.username}</strong>
            </>
          ) : author?._id ? (
            <>
              Recipe by <User id={author._id} />
            </>
          ) : null}
        </em>
      )}
    </article>
  )
}

Recipe.propTypes = {
  title: PropTypes.string.isRequired,
  ingredients: PropTypes.arrayOf(PropTypes.string),
  instructions: PropTypes.string,
  imageUrl: PropTypes.string,
  author: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      username: PropTypes.string,
    }),
  ]),
  recipeId: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool,
  likes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  ),
}
