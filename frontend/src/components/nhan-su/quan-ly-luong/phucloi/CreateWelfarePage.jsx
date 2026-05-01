import { useState, useRef } from 'react'
import { ChevronLeft, ChevronDown, RotateCcw, Loader2, Upload, X, FileText } from 'lucide-react'
import api from '../../../../api/axios'
import SuccessModal from '../../../common/SuccessModal'
import ConfirmCancelModal from '../../../common/ConfirmCancelModal'

const today = new Date().toISOString().split('T')[0]

const EMPTY = {
  name: '',
  benefit_type: '',
  cycle: '',
  effective_from: today,
  effective_to: '',
  value: '',
  value_unit: 'dong',
  scope: '',
  notes: '',
}

const BENEFIT_TYPE_OPTIONS = [
  { value: 'phu_cap', label: 'Phụ cấp' },
  { value: 'chinh_sach', label: 'Chính sách' },
  { value: 'van_hoa', label: 'Văn hoá' },
  { value: 'khac', label: 'Khác' },
]

const CYCLE_OPTIONS = [
  { value: 'hang_ngay', label: 'Hàng ngày' },
  { value: 'hang_thang', label: 'Hàng tháng' },
  { value: 'hang_quy', label: 'Hàng quý' },
  { value: 'hang_nam', label: 'Hàng năm' },
  { value: 'ngay_le_tet', label: 'Ngày lễ, tết' },
  { value: 'su_kien', label: 'Sự kiện' },
]

const SCOPE_OPTIONS = [
  { value: 'toan_cong_ty', label: 'Toàn công ty' },
  { value: 'theo_vai_tro', label: 'Theo vai trò' },
  { value: 'ca_nhan', label: 'Cá nhân' },
]

const VALUE_UNIT_OPTIONS = [
  { value: 'dong', label: 'đồng' },
  { value: 'phan_tram', label: '%' },
]

const BENEFIT_TYPE_LABEL = { phu_cap: 'Phụ cấp', chinh_sach: 'Chính sách', van_hoa: 'Văn hoá', khac: 'Khác' }
const CYCLE_LABEL = { hang_ngay: 'Hàng ngày', hang_thang: 'Hàng tháng', hang_quy: 'Hàng quý', hang_nam: 'Hàng năm', ngay_le_tet: 'Ngày lễ, tết', su_kien: 'Sự kiện' }
const SCOPE_LABEL = { toan_cong_ty: 'Toàn công ty', theo_vai_tro: 'Theo vai trò', ca_nhan: 'Cá nhân' }

const inp = err =>
  `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white transition-colors ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'
  }`

const sel = err =>
  `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white appearance-none transition-colors ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'
  }`

function SelectWrap({ children }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, required, children, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const formatDate = d => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

const formatValue = (val, unit) => {
  if (!val) return '—'
  const n = parseFloat(val) || 0
  if (unit === 'phan_tram') return `${n}%`
  return new Intl.NumberFormat('vi-VN').format(n) + ' đồng'
}

export default function CreateWelfarePage({ onCancel, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [savedData, setSavedData] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const fileInputRef = useRef(null)

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }))
  }

  const handleFiles = files => {
    const allowed = ['.doc', '.docx', '.pdf', '.jpg', '.jpeg', '.png']
    const maxSize = 20 * 1024 * 1024
    const newFiles = Array.from(files).filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      return allowed.includes(ext) && f.size <= maxSize
    })
    setAttachments(prev => [...prev, ...newFiles])
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeAttachment = idx => {
    setAttachments(prev => prev.filter((_, i) => i !== idx))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Vui lòng nhập tên chính sách phúc lợi.'
    if (!form.benefit_type) e.benefit_type = 'Vui lòng chọn loại phúc lợi.'
    if (!form.cycle) e.cycle = 'Vui lòng chọn chu kỳ áp dụng.'
    if (!form.effective_from) e.effective_from = 'Vui lòng chọn ngày hiệu lực từ.'
    if (!form.effective_to) e.effective_to = 'Vui lòng chọn ngày hiệu lực đến.'
    if (!form.value || parseFloat(form.value) < 0) e.value = 'Vui lòng nhập giá trị phúc lợi hợp lệ.'
    if (!form.scope) e.scope = 'Vui lòng chọn phạm vi áp dụng.'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      if (attachments.length > 0) fd.append('attachment', attachments[0])

      const res = await api.post('benefits/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSavedData(res.data)
      setShowSuccess(true)
    } catch (err) {
      const data = err.response?.data || {}
      const mapped = {}
      Object.entries(data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
      setErrors(mapped)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm(EMPTY)
    setErrors({})
    setAttachments([])
  }

  return (
    <div className="min-h-full bg-[#FFF6F3] p-6" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
      {/* Back */}
      <button
        onClick={() => setShowCancelConfirm(true)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-3"
      >
        <ChevronLeft size={16} />
        Quay lại danh sách phúc lợi
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">THÊM MỚI CHÍNH SÁCH PHÚC LỢI</h1>

      <div className="flex gap-5 items-start">
        {/* Left column */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              {/* Tên chính sách phúc lợi */}
              <Field label="Tên chính sách phúc lợi" required error={errors.name}>
                <input
                  type="text"
                  placeholder="Nhập tên chính sách phúc lợi"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  className={inp(errors.name)}
                />
              </Field>

              {/* Loại phúc lợi + Chu kỳ áp dụng */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Loại phúc lợi" required error={errors.benefit_type}>
                  <SelectWrap>
                    <select value={form.benefit_type} onChange={e => setField('benefit_type', e.target.value)} className={sel(errors.benefit_type)}>
                      <option value="">Chọn loại phúc lợi</option>
                      {BENEFIT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </SelectWrap>
                </Field>

                <Field label="Chu kỳ áp dụng" required error={errors.cycle}>
                  <SelectWrap>
                    <select value={form.cycle} onChange={e => setField('cycle', e.target.value)} className={sel(errors.cycle)}>
                      <option value="">Chọn chu kỳ áp dụng</option>
                      {CYCLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
              </div>

              {/* Hiệu lực từ + Hiệu lực đến */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Hiệu lực từ" required error={errors.effective_from}>
                  <input type="date" value={form.effective_from} onChange={e => setField('effective_from', e.target.value)} className={inp(errors.effective_from)} />
                </Field>
                <Field label="Hiệu lực đến" required error={errors.effective_to}>
                  <input type="date" value={form.effective_to} onChange={e => setField('effective_to', e.target.value)} className={inp(errors.effective_to)} />
                </Field>
              </div>

              {/* Giá trị phúc lợi + Phạm vi áp dụng */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Giá trị phúc lợi" required error={errors.value}>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.value}
                      onChange={e => setField('value', e.target.value)}
                      className={`flex-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white transition-colors ${errors.value ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'}`}
                    />
                    <SelectWrap>
                      <select
                        value={form.value_unit}
                        onChange={e => setField('value_unit', e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white appearance-none pr-8"
                      >
                        {VALUE_UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </SelectWrap>
                  </div>
                </Field>

                <Field label="Phạm vi áp dụng" required error={errors.scope}>
                  <SelectWrap>
                    <select value={form.scope} onChange={e => setField('scope', e.target.value)} className={sel(errors.scope)}>
                      <option value="">Chọn phạm vi áp dụng</option>
                      {SCOPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
              </div>
            </div>
          </div>

          {/* Đính kèm quyết định */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Đính kèm quyết định</h3>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-3">
                <Upload size={22} className="text-white" />
              </div>
              <p className="text-sm font-medium text-gray-700">Kéo thả file vào đây hoặc click để chọn file từ thiết bị</p>
              <p className="text-xs text-gray-400 mt-1">Hỗ trợ định dạng: .doc, .pdf, .jpg, .png (≤ 20MB). Cho phép chọn nhiều file</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                    <FileText size={16} className="text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => removeAttachment(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="w-80 flex-shrink-0 space-y-4">
          {/* Tóm tắt thông tin */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-3 border-b border-gray-100">Tóm tắt thông tin</h3>
            <p className="text-sm font-semibold text-gray-800 mb-4">
              {form.name || '—'}
            </p>
            <div className="space-y-3">
              {[
                { label: 'Loại phúc lợi', value: BENEFIT_TYPE_LABEL[form.benefit_type] },
                { label: 'Chu kỳ áp dụng', value: CYCLE_LABEL[form.cycle] },
                { label: 'Hiệu lực từ', value: formatDate(form.effective_from) },
                { label: 'Hiệu lực đến', value: formatDate(form.effective_to) },
                { label: 'Giá trị phúc lợi', value: form.value ? formatValue(form.value, form.value_unit) : null },
                { label: 'Phạm vi áp dụng', value: SCOPE_LABEL[form.scope] },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-800 text-right">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ghi chú */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Ghi chú</h3>
            <textarea
              placeholder="Nhập ghi chú..."
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              rows={6}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={handleReset}
          className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
          title="Đặt lại"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white"
        >
          Hủy bỏ
        </button>
        <button
          onClick={handleSave}
          disabled={saving || Boolean(errors.name)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: '#E67E22' }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Lưu
        </button>
      </div>

      {showSuccess && (
        <SuccessModal
          message="Thêm mới chính sách phúc lợi thành công!"
          onClose={() => {
            setShowSuccess(false)
            onSaved(savedData)
          }}
        />
      )}

      {showCancelConfirm && (
        <ConfirmCancelModal
          onConfirm={() => { setShowCancelConfirm(false); onCancel() }}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}
    </div>
  )
}
