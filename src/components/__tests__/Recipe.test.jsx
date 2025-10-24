import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PropTypes from 'prop-types'
import { Recipe } from '../components/Recipe.jsx'

const queryClient = new QueryClient()

const mockRecipe = {
  title: 'Test Recipe',
  ingredients: ['ingredient 1', 'ingredient 2'],
  instructions: 'Test instructions',
  imageUrl: 'https://example.com/image.jpg',
  author: { username: 'testuser' },
  recipeId: 'test-recipe-id',
  likes: [],
}

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </BrowserRouter>
)

TestWrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('Recipe Component', () => {
  test('recipe title should be a clickable link that opens in new tab', () => {
    render(
      <TestWrapper>
        <Recipe {...mockRecipe} />
      </TestWrapper>,
    )

    const titleLink = screen.getByRole('link', { name: 'Test Recipe' })

    expect(titleLink).toBeInTheDocument()
    expect(titleLink).toHaveAttribute('href', '/recipe/test-recipe-id')
    expect(titleLink).toHaveAttribute('target', '_blank')
    expect(titleLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
