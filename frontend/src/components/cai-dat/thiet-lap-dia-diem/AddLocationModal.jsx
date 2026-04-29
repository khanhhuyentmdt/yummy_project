import { useState, useEffect } from 'react'
import { X, RotateCcw, Loader2, Settings } from 'lucide-react'
import api from '../../../api/axios'

// ─── Static data ─────────────────────────────────────────────────────────────

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
]

const LOCATION_TYPES = [
  { value: 'san_xuat', label: 'Sản xuất' },
  { value: 'kho_hang', label: 'Kho hàng' },
  { value: 'cua_hang', label: 'Cửa hàng' },
]

const EMPTY_FORM = {
  name:             '',
  manager_id:       '',
  phone:            '',
  email:            '',
  address:          '',
  province:         '',
  district:         '',
  ward:             '',
  location_types:   [],
  manage_nvl:       false,
  manage_btp:       false,
  manage_thanh_pham: false,
  allow_delivery:   false,
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddLocationModal({ onClose, onSaved }) {
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [staffUsers, setStaffUsers] = useState([])

  // Fetch staff list for manager dropdown
  useEffect(() => {
    api.get('staff-users/')
      .then(res => setStaffUsers(res.data.users || []))
      .catch(() => setStaffUsers([]))
  }, [])

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setField = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  const toggleType = (value) => {
    setForm(f => ({
      ...f,
      location_types: f.location_types.includes(value)
        ? f.location_types.filter(t => t !== value)
        : [...f.location_types, value],
    }))
    setErrors(er => ({ ...er, location_types: undefined }))
  }

  const toggleSetup = (field) => {
    setForm(f => ({ ...f, [field]: !f[field] }))
  }

  const reset = () => { setForm(EMPTY_FORM); setErrors({}) }

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const errs = {}
    if (!form.name.trim())          errs.name        = 'Vui lòng nhập tên địa điểm'
    if (!form.manager_id)           errs.manager_id  = 'Vui lòng chọn nhân viên quản lý'
    if (!form.phone.trim())         errs.phone       = 'Vui lòng nhập số điện thoại'
    if (!form.location_types.length) errs.location_types = 'Vui lòng chọn ít nhất 1 loại'
    return errs
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        name:              form.name.trim(),
        manager_id:        Number(form.manager_id),
        phone:             form.phone.trim(),
        email:             form.email.trim(),
        address:           form.address.trim(),
        province:          form.province,
        district:          form.district.trim(),
        ward:              form.ward.trim(),
        location_types:    form.location_types,
        manage_nvl:        form.manage_nvl,
        manage_btp:        form.manage_btp,
        manage_thanh_pham: form.manage_thanh_pham,
        allow_delivery:    form.allow_delivery,
      }
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal container — scrollable */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900 tracking-wide">
            THÊM MỚI ĐỊA ĐIỂM
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-7">
          <form id="add-location-form" onSubmit={handleSubmit} noValidate>

            {errors.__global__ && (
              <div className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-[7px] px-3 py-2">
                {errors.__global__}
              </div>
            )}

            {/* 1 — Tên địa điểm */}
            <Field label="Tên địa điểm" required error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={setField('name')}
                placeholder="Nhập tên địa điểm"
                className={inputCls(errors.name)}
                autoFocus
              />
            </Field>

            {/* 2 — Nhân viên quản lý (half width, left) */}
            <div className="mt-5 w-1/2 pr-2">
              <Field label="Nhân viên quản lý" required error={errors.manager_id}>
                <div className="relative">
                  <select
                    value={form.manager_id}
                    onChange={setField('manager_id')}
                    className={`${inputCls(errors.manager_id)} appearance-none pr-9`}
                  >
                    <option value="">Chọn nhân viên quản lý</option>
                    {staffUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <ChevronSvg />
                </div>
              </Field>
            </div>

            {/* 3 — Số điện thoại | Email */}
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Field label="Số điện thoại" required error={errors.phone}>
                <input
                  type="text"
                  value={form.phone}
                  onChange={setField('phone')}
                  placeholder="Nhập số điện thoại"
                  className={inputCls(errors.phone)}
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  type="text"
                  value={form.email}
                  onChange={setField('email')}
                  placeholder="Nhập email"
                  className={inputCls(errors.email)}
                />
              </Field>
            </div>

            {/* 4 — Địa chỉ | Tỉnh/Thành phố */}
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Field label="Địa chỉ" error={errors.address}>
                <input
                  type="text"
                  value={form.address}
                  onChange={setField('address')}
                  placeholder="Nhập địa chỉ"
                  className={inputCls(errors.address)}
                />
              </Field>
              <Field label="Tỉnh/ Thành phố" error={errors.province}>
                <div className="relative">
                  <select
                    value={form.province}
                    onChange={setField('province')}
                    className={`${inputCls(errors.province)} appearance-none pr-9`}
                  >
                    <option value="">Chọn tỉnh/ thành phố</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronSvg />
                </div>
              </Field>
            </div>

            {/* 5 — Quận/Huyện | Phường/Xã */}
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Field label="Quận/ Huyện" error={errors.district}>
                <div className="relative">
                  <input
                    type="text"
                    value={form.district}
                    onChange={setField('district')}
                    placeholder="Chọn quận/ huyện"
                    className={inputCls(errors.district)}
                  />
                  <ChevronSvg />
                </div>
              </Field>
              <Field label="Phường/ Xã" error={errors.ward}>
                <div className="relative">
                  <input
                    type="text"
                    value={form.ward}
                    onChange={setField('ward')}
                    placeholder="Chọn phường/ xã"
                    className={inputCls(errors.ward)}
                  />
                  <ChevronSvg />
                </div>
              </Field>
            </div>

            {/* 6 — Loại địa điểm */}
            <div className="mt-5">
              <label className="text-sm font-medium text-gray-700">
                Loại địa điểm
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="mt-2.5 flex items-center gap-8">
                {LOCATION_TYPES.map(t => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.location_types.includes(t.value)}
                      onChange={() => toggleType(t.value)}
                      className="w-4 h-4 rounded border-gray-300 accent-orange-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{t.label}</span>
                  </label>
                ))}
              </div>
              {errors.location_types && (
                <p className="mt-1 text-xs text-red-500">{errors.location_types}</p>
              )}
            </div>

            {/* 7 — Thiết lập địa điểm */}
            <div className="mt-5 mb-6 border border-gray-100 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderLeft: '4px solid #E67E22' }}
              >
                <Settings size={15} className="text-orange-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-orange-500">Thiết lập địa điểm</span>
              </div>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-8 gap-y-3 mt-1">
                {[
                  { field: 'manage_nvl',        label: 'Quản lý nguyên vật liệu' },
                  { field: 'manage_btp',        label: 'Quản lý bán thành phẩm' },
                  { field: 'manage_thanh_pham', label: 'Quản lý thành phẩm' },
                  { field: 'allow_delivery',    label: 'Cho phép giao hàng' },
                ].map(item => (
                  <label key={item.field} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form[item.field]}
                      onChange={() => toggleSetup(item.field)}
                      className="w-4 h-4 rounded border-gray-300 accent-orange-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-7 py-5 flex-shrink-0 border-t border-gray-100">
          <button
            type="button"
            onClick={reset}
            title="Đặt lại"
            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
          >
            <RotateCcw size={16} />
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-[7px] hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="add-location-form"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-[7px] hover:opacity-90 active:opacity-80 disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: '#E67E22' }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Lưu
            </button>
          </div>
        </div>
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
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

function ChevronSvg() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm border rounded-[7px] focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
    err
      ? 'border-red-400 bg-red-50 focus:border-red-400'
      : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300'
  }`
