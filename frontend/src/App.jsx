import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import HomePage from './components/tong-quan/trang-chu/HomePage'

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      const token  = localStorage.getItem('access_token')
      return (stored && token) ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return <HomePage user={user} onLogout={handleLogout} />
}

export default App
