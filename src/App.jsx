import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Recipes } from './pages/Recipes.jsx'
import { Signup } from './pages/Signup.jsx'
import { MyRecipes } from './pages/MyRecipes.jsx'

import { Login } from './pages/Login.jsx'

import { AuthContextProvider } from './contexts/AuthContext.jsx'
import { SocketProvider } from './contexts/SocketContext.jsx'
import { RecipeNotification } from './components/RecipeNotification.jsx'

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

const queryClient = new QueryClient()

// Layout component that includes the RecipeNotification
function Layout() {
  return (
    <>
      <Outlet />
      <RecipeNotification />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Recipes />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'my-recipes',
        element: <MyRecipes />,
      },
    ],
  },
])

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  )
}
