import { useState, useRef } from 'react'
import { ChevronLeft, ChevronDown, RotateCcw, Loader2 } from 'lucide-react'
import api from '../api/axios'
import SuccessModal from './SuccessModal'

// ─── Static options ───────────────────────────────────────────────────────────

const MATERIAL_GROUPS = [
  'Đồ khô',
  'Sữa & Kem',
  'Trái cây tươi',
  'Bao bì',
  'Phụ gia',
  'Gia vị',
  'Khác',
]

const MATERIAL_UNITS = [
  'kilogram',
  'gram',
  'lít',
  'ml',
  'cái',
  'hộp',
  'gói',
  'túi',
]

const INITIAL_FORM = {
  name:             '',
  group:            '',
  unit:             '',
  notes:            '',
  batch_management: false,
  status:           'active',
}

// ─── Image placeholder icon (SVG) ────────────────────────────────────────────

function ImagePlaceholderIcon() {
  return (
    <svg
      width="72" height="72"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-300"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateMaterialPage({ onCancel, onSaved }) {
  const [form, setForm]             = useState(INITIAL_FORM)
  const [saving, setSaving]         = useState(false)
  const [errors, setErrors]         = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [showSuccess, setShowSuccess]   = useState(false)
  const fileInputRef   = useRef(null)
  const imageFileRef   = useRef(null)
  const pendingSavedRef = useRef(null)

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    imageFileRef.current = file
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    imageFileRef.current = file
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setErrors({})
    setImagePreview(null)
    imageFileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name  = 'Vui lòng nhập tên nguyên vật liệu'
    if (!form.group)       errs.group = 'Vui lòng chọn nhóm nguyên vật liệu'
    if (!form.unit)        errs.unit  = 'Vui lòng chọn đơn vị tính'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name',             form.name.trim())
      fd.append('group',            form.group)
      fd.append('unit',             form.unit)
      fd.append('notes',            form.notes)
      fd.append('batch_management', form.batch_management ? 'true' : 'false')
      fd.append('status',           form.status)
      if (imageFileRef.current) fd.append('image', imageFileRef.current)

      const res = await api.post('materials/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      pendingSavedRef.current = res.data
      setShowSuccess(true)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const mapped = {}
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : String(v)
        }
        setErrors(mapped)
      } else {
        setErrors({ submit: 'Có lỗi xảy ra, thử lại sau.' })
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="pb-24">

      {/* ── Back link + Title ───────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-2"
        >
          <ChevronLeft size={15} />
          Quay lại danh sách nguyên vật liệu
        </button>
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
          THÊM MỚI NGUYÊN VẬT LIỆU
        </h1>
      </div>

      {/* Global error */}
      {errors.submit && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      {/* ── 2-column grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left (3/5) — Thông tin chung ────────────── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Thông tin chung
            </h2>

            {/* Tên nguyên vật liệu */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên nguyên vật liệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="Nhập tên nguyên vật liệu"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
                  errors.name
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 bg-gray-50 focus:bg-white'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Nhóm NVL + Đơn vị tính — same row */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Nhóm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nhóm nguyên vật liệu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.group}
                    onChange={e => setField('group', e.target.value)}
                    className={`w-full px-3 pr-8 py-2.5 text-sm border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
                      errors.group
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-gray-50 focus:bg-white'
                    }`}
                  >
                    <option value="">Chọn nhóm nguyên vật liệu</option>
                    {MATERIAL_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.group && (
                  <p className="mt-1 text-xs text-red-500">{errors.group}</p>
                )}
              </div>

              {/* Đơn vị tính */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Đơn vị tính <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.unit}
                    onChange={e => setField('unit', e.target.value)}
                    className={`w-full px-3 pr-8 py-2.5 text-sm border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
                      errors.unit
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-gray-50 focus:bg-white'
                    }`}
                  >
                    <option value="">Chọn đơn vị tính</option>
                    {MATERIAL_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.unit && (
                  <p className="mt-1 text-xs text-red-500">{errors.unit}</p>
                )}
              </div>
            </div>

            {/* Ghi chú */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ghi chú
              </label>
              <textarea
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                placeholder="Nhập ghi chú"
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors resize-none"
              />
            </div>

            {/* Checkbox quản lý theo lô */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="batch_management"
                checked={form.batch_management}
                onChange={e => setField('batch_management', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-orange-500 cursor-pointer"
              />
              <label
                htmlFor="batch_management"
                className="text-sm text-gray-600 cursor-pointer select-none"
              >
                Quản lý sản phẩm theo lô - HSD
              </label>
            </div>
          </div>
        </div>

        {/* ── Right (2/5) — Hình ảnh ───────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Hình ảnh nguyên vật liệu
            </h2>

            {/* Drop zone */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors min-h-[220px] p-6"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="max-h-48 max-w-full rounded-lg object-contain"
                />
              ) : (
                <>
                  <ImagePlaceholderIcon />
                  <p className="text-sm text-gray-500 text-center leading-relaxed mt-4">
                    Kéo thả hoặc tải ảnh lên từ thiết bị.
                  </p>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Chỉ chấp nhận tệp hình ảnh *.pnj, *.jpg và *.jpeg.
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              className="hidden"
              onChange={handleImageChange}
            />

            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null)
                  imageFileRef.current = null
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Xoá ảnh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky footer ───────────────────────────────── */}
      {/*
        sticky bottom-0 inside overflow-auto main → sticks to bottom of
        the visible main area; -mx-6 -mb-6 bleeds past the main p-6 padding.
      */}
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 bg-white border-t border-gray-200 px-6 py-4 flex items-center z-10">
        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          title="Đặt lại form"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RotateCcw size={18} />
        </button>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-60 hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: '#E67E22' }}
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            Lưu
          </button>
        </div>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <SuccessModal
          message="Thêm nguyên vật liệu thành công!"
          onClose={() => {
            setShowSuccess(false)
            onSaved(pendingSavedRef.current)
          }}
        />
      )}
    </div>
  )
}
