import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import api from '../../api/axios'

const GROUPS = [
  'Trà hồ Singapore',
  'Matcha Trà hồ',
  'Cà phê',
  'Nước ép',
  'Khác',
]

const UNITS = ['Ly', 'Phần', 'Chai', 'Hộp', 'Kg', 'Gói']

const EMPTY_FORM = {
  code: '', name: '', group: '', unit: '', price: '', status: 'active',
}

export default function ProductModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product)
  const [form, setForm]     = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  useEffect(() => {
    if (product) {
      setForm({
        code:   product.code   ?? '',
        name:   product.name   ?? '',
        group:  product.group  ?? '',
        unit:   product.unit   ?? '',
        price:  product.price  ?? '',
        status: product.status ?? 'active',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [product])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.code.trim())  errs.code  = 'Mã SP không được để trống'
    if (!form.name.trim())  errs.name  = 'Tên sản phẩm không được để trống'
    if (!form.group.trim()) errs.group = 'Chọn nhóm sản phẩm'
    if (!form.unit.trim())  errs.unit  = 'Chọn đơn vị tính'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = 'Giá bán phải là số không âm'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = { ...form, price: Number(form.price) }
      if (isEdit) {
        const res = await api.put(`products/${product.id}/`, payload)
        onSaved(res.data, 'update')
      } else {
        const res = await api.post('products/', payload)
        onSaved(res.data, 'create')
      }
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        // Map DRF field errors
        const mapped = {}
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : v
        }
        setErrors(mapped)
      } else {
        setErrors({ __global__: 'Có lỗi xảy ra, thử lại sau.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {errors.__global__ && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errors.__global__}
            </p>
          )}

          {/* Mã SP + Tên */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mã SP *" error={errors.code}>
              <input
                value={form.code}
                onChange={set('code')}
                placeholder="VD: HSP011"
                className={inputCls(errors.code)}
              />
            </Field>
            <Field label="Đơn vị tính *" error={errors.unit}>
              <select value={form.unit} onChange={set('unit')} className={inputCls(errors.unit)}>
                <option value="">-- Chọn --</option>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Tên sản phẩm *" error={errors.name}>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="VD: Trà hồ Khoai môn 3 vị"
              className={inputCls(errors.name)}
            />
          </Field>

          <Field label="Nhóm sản phẩm *" error={errors.group}>
            <select value={form.group} onChange={set('group')} className={inputCls(errors.group)}>
              <option value="">-- Chọn nhóm --</option>
              {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá bán (đ) *" error={errors.price}>
              <input
                type="number"
                min="0"
                step="500"
                value={form.price}
                onChange={set('price')}
                placeholder="VD: 28000"
                className={inputCls(errors.price)}
              />
            </Field>
            <Field label="Trạng thái" error={errors.status}>
              <select value={form.status} onChange={set('status')} className={inputCls(errors.status)}>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </Field>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading
                ? <Loader2 size={15} className="animate-spin" />
                : <Save size={15} />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = (err) =>
  `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
  }`
