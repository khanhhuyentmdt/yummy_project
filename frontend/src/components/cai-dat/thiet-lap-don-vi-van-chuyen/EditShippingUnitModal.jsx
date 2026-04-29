import { useState, useEffect } from 'react'
import { X, RotateCcw, Loader2, Clock } from 'lucide-react'
import api from '../../../api/axios'
import SuccessModal from '../../common/SuccessModal'

export default function EditShippingUnitModal({ shippingUnit, onClose, onSaved }) {
  const [suData, setSuData] = useState(null)
  const [form, setForm] = useState({
    name:     '',
    phone:    '',
    email:    '',
    address:  '',
    city:     '',
    district: '',
    ward:     '',
    notes:    '',
    status:   'active',
  })
  const [originalForm, setOriginalForm] = useState({})
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  // Load full data
  useEffect(() => {
    api.get(`shipping-units/${shippingUnit.id}/`)
      .then(res => {
        setSuData(res.data)
        const f = {
          name:     res.data.name || '',
          phone:    res.data.phone || '',
          email:    res.data.email || '',
          address:  res.data.address || '',
          city:     res.data.city || '',
          district: res.data.district || '',
          ward:     res.data.ward || '',
          notes:    res.data.notes || '',
          status:   res.data.status || 'active',
        }
        setForm(f)
        setOriginalForm(f)
      })
      .catch(() => {})
  }, [shippingUnit.id])

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !successMsg) onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, successMsg])

  const setField = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  const reset = () => { setForm(originalForm); setErrors({}) }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())    errs.name    = 'Vui lòng nhập tên đối tác'
    if (!form.phone.trim())   errs.phone   = 'Vui lòng nhập số điện thoại'
    if (!form.address.trim()) errs.address = 'Vui lòng nhập địa chỉ'
    if (!form.city.trim())    errs.city    = 'Vui lòng chọn Tỉnh/Thành phố'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        name:     form.name.trim(),
        phone:    form.phone.trim(),
        email:    form.email.trim(),
        address:  form.address.trim(),
        city:     form.city.trim(),
        district: form.district.trim(),
        ward:     form.ward.trim(),
        notes:    form.notes.trim(),
        status:   form.status,
      }
      const res = await api.patch(`shipping-units/${shippingUnit.id}/`, payload)
      setSuData(res.data)
      const newForm = {
        name:     res.data.name || '',
        phone:    res.data.phone || '',
        email:    res.data.email || '',
        address:  res.data.address || '',
        city:     res.data.city || '',
        district: res.data.district || '',
        ward:     res.data.ward || '',
        notes:    res.data.notes || '',
        status:   res.data.status || 'active',
      }
      setForm(newForm)
      setOriginalForm(newForm)
      onSaved(res.data)
      setSuccessMsg('Cập nhật đối tác vận chuyển thành công!')
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

  const inputCls = (err) => `w-full px-3 py-2 text-sm border rounded-[7px] focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
    err ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
  }`

  // Group history by date
  const groupedHistory = (suData?.history || []).reduce((acc, h) => {
    const date = new Date(h.timestamp).toLocaleDateString('vi-VN')
    if (!acc[date]) acc[date] = []
    acc[date].push(h)
    return acc
  }, {})

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onMouseDown={(e) => { if (e.target === e.currentTarget && !successMsg) onClose() }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-800">CHỈNH SỬA ĐỐI TÁC TƯ LIÊN HỆ</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            {errors.__global__ && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.__global__}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Mã đối tác (readonly) */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mã đối tác
                </label>
                <input
                  type="text"
                  value={suData?.code || ''}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-[7px] bg-gray-100 text-gray-500"
                />
              </div>

              {/* Tên đối tác */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tên đối tác <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={setField('name')}
                  placeholder="Nhập tên đối tác"
                  className={inputCls(errors.name)}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={setField('phone')}
                  placeholder="Nhập số điện thoại"
                  className={inputCls(errors.phone)}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={setField('email')}
                  placeholder="Nhập email"
                  className={inputCls(errors.email)}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={setField('address')}
                  placeholder="Nhập địa chỉ"
                  className={inputCls(errors.address)}
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              {/* Tỉnh/Thành phố */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tỉnh/ Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.city}
                  onChange={setField('city')}
                  className={inputCls(errors.city)}
                >
                  <option value="">Chọn Tỉnh/ Thành phố</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>

              {/* Quận/Huyện */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Quận/ Huyện
                </label>
                <select
                  value={form.district}
                  onChange={setField('district')}
                  className={inputCls(errors.district)}
                  disabled={!form.city}
                >
                  <option value="">Chọn Quận/ Huyện</option>
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 2">Quận 2</option>
                  <option value="Quận 3">Quận 3</option>
                </select>
              </div>

              {/* Phường/Xã */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phường/ Xã
                </label>
                <select
                  value={form.ward}
                  onChange={setField('ward')}
                  className={inputCls(errors.ward)}
                  disabled={!form.district}
                >
                  <option value="">Chọn Phường/ Xã</option>
                  <option value="Phường 1">Phường 1</option>
                  <option value="Phường 2">Phường 2</option>
                  <option value="Phường 3">Phường 3</option>
                </select>
              </div>

              {/* Ghi chú */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ghi chú
                </label>
                <textarea
                  value={form.notes}
                  onChange={setField('notes')}
                  placeholder="Nhập ghi chú..."
                  rows={3}
                  className={inputCls(errors.notes)}
                />
              </div>

              {/* Trạng thái */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Trạng thái
                </label>
                <select
                  value={form.status}
                  onChange={setField('status')}
                  className={inputCls(errors.status)}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngưng hoạt động</option>
                </select>
              </div>
            </div>

            {/* Lịch sử thay đổi */}
            {suData?.history && suData.history.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Lịch sử thay đổi
                  </h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(groupedHistory).map(([date, items]) => (
                    <div key={date}>
                      <p className="text-xs font-semibold text-gray-400 mb-2">{date}</p>
                      <div className="space-y-2">
                        {items.map(h => (
                          <div key={h.id} className="flex items-start gap-3 text-sm">
                            <span className="text-orange-500 mt-1.5">•</span>
                            <div className="flex-1">
                              <p className="text-gray-700">
                                {h.action.split(' ').map((word, i) => 
                                  word.match(/^[A-Z0-9]+$/) ? (
                                    <span key={i} className="text-orange-500 font-semibold">{word} </span>
                                  ) : (
                                    <span key={i}>{word} </span>
                                  )
                                )}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {h.actor_name} • {new Date(h.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-[7px] hover:bg-gray-200 transition-colors"
              >
                <RotateCcw size={14} />
                Đặt lại
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-[7px] hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-[7px] transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#E67E22' }}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Internal Success Modal */}
      {successMsg && (
        <SuccessModal
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
    </>
  )
}
