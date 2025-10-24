import { Fragment, memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Recipe } from './Recipe.jsx'

export const RecipeList = memo(function RecipeList({
  recipes = [],
  showActions = false,
  onEdit,
  onDelete,
}) {
  const recipeElements = useMemo(
    () =>
      recipes.map((recipe) => (
        <Fragment key={recipe._id}>
          <Recipe
            {...recipe}
            recipeId={recipe._id}
            showActions={showActions}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          <hr />
        </Fragment>
      )),
    [recipes, showActions, onEdit, onDelete],
  )

  return <div>{recipeElements}</div>
})

RecipeList.propTypes = {
  recipes: PropTypes.arrayOf(PropTypes.shape(Recipe.propTypes)).isRequired,
  showActions: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
}
