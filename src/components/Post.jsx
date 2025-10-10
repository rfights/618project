import PropTypes from 'prop-types'
import { User } from './User.jsx'

export function Post({ title, contents, author: userID }) {
  return (
    <article>
      <h3>{title}</h3>
      <div>{contents}</div>
      {userID && (
        <em>
          <br />
          Written by <User id={userID} />
        </em>
      )}
    </article>
  )
}

Post.propTypes = {
  title: PropTypes.string.isRequired,
  contents: PropTypes.string,
  author: PropTypes.string,
}
