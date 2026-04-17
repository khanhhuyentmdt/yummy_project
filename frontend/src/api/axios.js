import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:2344/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT access token to every request if available
// Also remove Content-Type for FormData so browser can set multipart boundary
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// Handle 401 — clear token and reload to trigger LoginPage
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginEndpoint = error.config?.url?.includes('auth/login/')
      if (!isLoginEndpoint) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.reload()
      }
    }
    return Promise.reject(error)
  }
)

export default api
