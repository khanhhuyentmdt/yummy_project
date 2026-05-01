import { useEffect, useState } from 'react'
import api from './api/axios'
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
  const [bootstrapping, setBootstrapping] = useState(() => !!user)

  useEffect(() => {
    let cancelled = false

    if (!user) {
      setBootstrapping(false)
      return () => {
        cancelled = true
      }
    }

    setBootstrapping(true)
    api
      .post('production-defaults/bootstrap/')
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setBootstrapping(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

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

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-[#F9F3F0] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-md px-8 py-8 text-center max-w-sm w-full">
          <div className="mx-auto mb-4 h-10 w-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <h2 className="text-lg font-semibold text-gray-800">
            Đang chuẩn bị dữ liệu mặc định
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Hệ thống đang khởi tạo dữ liệu sản xuất cho lần đầu sử dụng.
          </p>
        </div>
      </div>
    )
  }

  return <HomePage user={user} onLogout={handleLogout} />
}

export default App
