import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export function Header() {
  const [user, setUser] = useAuth()

  const headerStyle = {
    background: 'linear-gradient(135deg, #d06bffff 0%, #d624eeff 100%)',
    color: 'white',
    padding: '20px 40px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    borderRadius: '0 0 15px 15px',
    marginBottom: '20px',
  }

  const titleStyle = {
    margin: 0,
    fontSize: '2.5rem',
    fontWeight: '700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  }

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  }

  if (user) {
    return (
      <header style={headerStyle}>
        <div style={containerStyle}>
          <div>
            <h1 style={titleStyle}>Ramey&rsquo;s Recipes</h1>
            <p
              style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '1.1rem' }}
            >
              Share, edit, and like recipes!
            </p>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>
              👋 Welcome, {user.username}!
            </span>
            <button
              onClick={() => setUser(null)}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#667eea',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '15px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div>
          <h1 style={titleStyle}>Ramey&rsquo;s Recipes</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '1.1rem' }}>
            Share, edit, and like recipes!
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
          }}
        >
          <Link
            to='/login'
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.2)',
              fontWeight: '500',
            }}
          >
            Log In
          </Link>
          <Link
            to='/signup'
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.2)',
              fontWeight: '500',
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  )
}
