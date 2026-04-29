import { useState, useEffect } from 'react'
import { X, RotateCcw, Loader2 } from 'lucide-react'
import api from '../../../api/axios'

const EMPTY_FORM = {
  code:    '',
  name:    '',
  phone:   '',
  address: '',
  status:  'active',
}

export default function AddLocationModal({ onClose, onSaved }) {
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  const reset = () => {
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Tên địa điểm không được để trống'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        name:    form.name.trim(),
        address: form.address.trim(),
        phone:   form.phone.trim(),
        status:  form.status,
      }
      if (form.code.trim()) payload.code = form.code.trim()

      const res = await api.post('locations/', payload)
      onSaved(res.data)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const mapped = {}
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : String(v)
        }
        setErrors(mapped)
      } else {
        setErrors({ __global__: 'Có lỗi xảy ra, vui lòng thử lại.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">
            Thêm mới địa điểm
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-7 py-6 space-y-5">

            {errors.__global__ && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-[7px] px-3 py-2">
                {errors.__global__}
              </p>
            )}

            {/* Tên địa điểm — full width */}
            <Field label="Tên địa điểm" required error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Nhập tên địa điểm"
                className={inputCls(errors.name)}
                autoFocus
              />
            </Field>

            {/* SĐT + Mã địa điểm — 2 cột */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Số điện thoại" error={errors.phone}>
                <input
                  type="text"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="Nhập số điện thoại"
                  className={inputCls(errors.phone)}
                />
              </Field>
              <Field label="Mã địa điểm" error={errors.code}>
                <input
                  type="text"
                  value={form.code}
                  onChange={set('code')}
                  placeholder="Tự động nếu để trống"
                  className={inputCls(errors.code)}
                />
              </Field>
            </div>

            {/* Địa chỉ — full width */}
            <Field label="Địa chỉ" error={errors.address}>
              <input
                type="text"
                value={form.address}
                onChange={set('address')}
                placeholder="Nhập địa chỉ"
                className={inputCls(errors.address)}
              />
            </Field>

            {/* Trạng thái */}
            <Field label="Trạng thái" error={errors.status}>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={set('status')}
                  className={`${inputCls(errors.status)} appearance-none pr-9`}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm ngưng</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </Field>

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={reset}
              title="Đặt lại"
              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <RotateCcw size={15} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-[7px] hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-[7px] hover:opacity-90 active:opacity-80 disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: '#E67E22' }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm border rounded-[7px] focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
    err
      ? 'border-red-400 bg-red-50 focus:border-red-400'
      : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300'
  }`
