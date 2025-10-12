import PropTypes from 'prop-types'
import { User } from './User.jsx'

export function Recipe({ title, ingredients, instructions, imageUrl, author }) {
  return (
    <article
      style={{
        marginBottom: '20px',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}
    >
      <h3>{title}</h3>

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
}
