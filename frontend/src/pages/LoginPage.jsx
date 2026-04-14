import { useState } from 'react'
import { Phone, Lock, Eye, EyeOff } from 'lucide-react'
import api from '../api/axios'
import logoImg from '../assets/logo.jpg'

export default function LoginPage({ onLoginSuccess }) {
  const [phone, setPhone]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ số điện thoại và mật khẩu.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('auth/login/', { phone_number: phone, password })
      const { access, refresh, user } = res.data

      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(user))

      onLoginSuccess(user)
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Đăng nhập thất bại. Vui lòng thử lại.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* ── Left panel: food photo ──────────────────────────────────────── */}
      <div
        className="hidden lg:block lg:w-1/2 flex-shrink-0"
        style={{
          backgroundImage: "url('/login-bg.png')",
          backgroundSize: '210% auto',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* ── Right panel: login form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#F9F3F0] px-6 py-10">
        <div className="w-full max-w-sm">

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-md px-10 py-10">

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src={logoImg}
                alt="Yummy Logo"
                className="w-20 h-20 rounded-full object-cover shadow-md"
              />
            </div>

            {/* Heading */}
            <h1 className="text-center text-xl font-bold text-gray-800 mb-1">
              Đăng Nhập Tài Khoản
            </h1>
            <p className="text-center text-xs text-gray-400 mb-7">
              Chào mừng đến với nền tảng quản lý của Yummy!
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>

              {/* Phone input */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-500 text-center">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#E67E22] hover:bg-[#CA6F1E] active:bg-[#B7600E] text-white text-sm font-bold tracking-widest uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Đang đăng nhập...
                  </span>
                ) : 'ĐĂNG NHẬP'}
              </button>

            </form>
          </div>

          {/* Test account hint */}
          <p className="mt-5 text-center text-xs text-gray-400">
            Demo: <span className="font-mono text-gray-500">0915085900</span>
            {' / '}
            <span className="font-mono text-gray-500">12345</span>
          </p>
        </div>
      </div>
    </div>
  )
}
