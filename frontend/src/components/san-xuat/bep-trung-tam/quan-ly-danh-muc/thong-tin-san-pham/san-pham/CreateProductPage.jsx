import { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronDown, Plus, X, Upload, Loader2, AlertTriangle } from 'lucide-react'
import api from '../../../../../../api/axios'
import SuccessModal from '../../../../../common/SuccessModal'

const PRODUCT_GROUPS = [
  'Trà hồ Singapore',
  'Matcha Trà hồ',
  'Cà phê',
  'Trà hoa quả',
  'Khác',
]

const PRODUCT_UNITS = ['Ly', 'Phần', 'Chai', 'Hộp', 'Gói', 'Kg']

const BOM_UNITS = ['g', 'kg', 'ml', 'l', 'muỗng', 'muỗng cà phê', 'lá', 'viên', 'gói']

const formatCurrency = (val) => {
  const n = parseFloat(val) || 0
  return new Intl.NumberFormat('vi-VN').format(n)
}

export default function CreateProductPage({ onCancel, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    group: '',
    unit: '',
    description: '',
    price: '',
    cost_price: '',
    compare_price: '',
    production_notes: '',
    notes: '',
    status: 'active',
  })
  const [bomRows, setBomRows] = useState([
    { raw_material_id: '', quantity: '', unit: '' },
    { raw_material_id: '', quantity: '', unit: '' },
  ])
  const [rawMaterials, setRawMaterials] = useState([])
  const [saving, setSaving]             = useState(false)
  const [errors, setErrors]             = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [showSuccess, setShowSuccess]   = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const fileInputRef                    = useRef(null)
  const imageFileRef                    = useRef(null)  // stores the actual File object
  const pendingSavedRef                 = useRef(null)  // product data to pass to onSaved

  useEffect(() => {
    api.get('raw-materials/')
      .then(res => setRawMaterials(res.data.raw_materials || []))
      .catch(() => {})
  }, [])

  /* ── Computed pricing ─────────────────────────────────── */
  const price      = parseFloat(form.price)       || 0
  const costPrice  = parseFloat(form.cost_price)  || 0
  const profit     = price - costPrice
  const margin     = price > 0 ? ((profit / price) * 100).toFixed(1) + '%' : '--'
  const profitDisp = price > 0 ? formatCurrency(profit) + ' đ' : '0 đ'

  /* ── Handlers ─────────────────────────────────────────── */
  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const addBomRow = () =>
    setBomRows(rows => [...rows, { raw_material_id: '', quantity: '', unit: '' }])

  const removeBomRow = (idx) =>
    setBomRows(rows => rows.filter((_, i) => i !== idx))

  const updateBomRow = (idx, key, val) => {
    setBomRows(rows => rows.map((row, i) => {
      if (i !== idx) return row
      const updated = { ...row, [key]: val }
      if (key === 'raw_material_id' && val) {
        const mat = rawMaterials.find(m => String(m.id) === String(val))
        if (mat) updated.unit = mat.unit
      }
      return updated
    }))
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

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name  = 'Vui lòng nhập tên sản phẩm'
    if (!form.group)       errs.group = 'Vui lòng chọn nhóm sản phẩm'
    if (!form.unit)        errs.unit  = 'Vui lòng chọn đơn vị tính'
    if (!form.price || Number(form.price) <= 0)
      errs.price = 'Vui lòng nhập giá bán hợp lệ'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const validBom = bomRows.filter(r => r.raw_material_id && r.quantity)
      const payload  = {
        name:             form.name.trim(),
        group:            form.group,
        unit:             form.unit,
        description:      form.description,
        price:            parseFloat(form.price)         || 0,
        cost_price:       parseFloat(form.cost_price)    || 0,
        compare_price:    parseFloat(form.compare_price) || 0,
        production_notes: form.production_notes,
        notes:            form.notes,
        status:           form.status,
        quantity:         0,
        bom_items: validBom.map(r => ({
          raw_material_id: parseInt(r.raw_material_id),
          quantity:        parseFloat(r.quantity) || 0,
          unit:            r.unit || '',
        })),
      }

      // Step 1: create product via JSON
      const res      = await api.post('products/', payload)
      const newId    = res.data.id
      let   saved    = res.data

      // Step 2: upload image if a file was selected
      if (imageFileRef.current) {
        const fd = new FormData()
        fd.append('image', imageFileRef.current)
        await api.patch(`products/${newId}/`, fd)
        // fetch fresh copy with absolute image URL
        const detail = await api.get(`products/${newId}/`)
        saved = detail.data
      }

      pendingSavedRef.current = saved
      setShowSuccess(true)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const mapped = {}
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : v
        }
        setErrors(mapped)
      } else {
        setErrors({ submit: 'Có lỗi xảy ra, thử lại sau.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const requestCancel = () => {
    if (saving) return
    setShowCancelConfirm(true)
  }

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div>
      {/* Breadcrumb + Title */}
      <div className="mb-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
          <span
            className="hover:text-orange-500 cursor-pointer transition-colors"
            onClick={requestCancel}
          >
            Sản phẩm
          </span>
          <ChevronRight size={14} />
          <span className="text-orange-500 font-medium">Thêm mới sản phẩm</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">THÊM MỚI SẢN PHẨM</h1>
      </div>

      {/* Global error */}
      {errors.submit && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section: Thông tin chung */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5">Thông tin chung</h2>

            {/* Tên sản phẩm */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="Nhập tên sản phẩm"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Nhóm SP + Đơn vị tính */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nhóm sản phẩm <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.group}
                    onChange={e => setField('group', e.target.value)}
                    className={`w-full px-3 pr-8 py-2.5 text-sm border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
                      errors.group ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                    }`}
                  >
                    <option value="">Chọn nhóm sản phẩm</option>
                    {PRODUCT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.group && <p className="mt-1 text-xs text-red-500">{errors.group}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Đơn vị tính <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.unit}
                    onChange={e => setField('unit', e.target.value)}
                    className={`w-full px-3 pr-8 py-2.5 text-sm border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
                      errors.unit ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                    }`}
                  >
                    <option value="">Chọn đơn vị tính</option>
                    {PRODUCT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit}</p>}
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả sản phẩm</label>
              <textarea
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="Nhập mô tả sản phẩm"
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Section: Thông tin sản xuất */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5">Thông tin sản xuất</h2>

            {/* BOM header */}
            <p className="text-sm font-medium text-gray-700 mb-3">
              Định mức nguyên liệu (BOM) <span className="text-red-500">*</span>
            </p>

            {/* BOM table header */}
            <div className="grid grid-cols-[1fr_120px_140px_36px] gap-2 mb-2 px-1">
              <span className="text-xs font-medium text-gray-500">Nguyên liệu</span>
              <span className="text-xs font-medium text-gray-500">Định lượng</span>
              <span className="text-xs font-medium text-gray-500">Đơn vị</span>
              <span />
            </div>

            {/* BOM rows */}
            <div className="space-y-2 mb-3">
              {bomRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_120px_140px_36px] gap-2 items-center">
                  <div className="relative">
                    <select
                      value={row.raw_material_id}
                      onChange={e => updateBomRow(idx, 'raw_material_id', e.target.value)}
                      className="w-full px-3 pr-8 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <option value="">Chọn nguyên liệu</option>
                      {rawMaterials.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={row.quantity}
                    onChange={e => updateBomRow(idx, 'quantity', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <div className="relative">
                    <select
                      value={row.unit}
                      onChange={e => updateBomRow(idx, 'unit', e.target.value)}
                      className="w-full px-3 pr-8 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <option value="">Chọn đơn vị</option>
                      {BOM_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBomRow(idx)}
                    className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add row */}
            <button
              type="button"
              onClick={addBomRow}
              className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium mb-5 transition-colors"
            >
              <Plus size={15} />
              Thêm nguyên liệu
            </button>

            {/* Ghi chú sản xuất */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú sản xuất</label>
              <textarea
                value={form.production_notes}
                onChange={e => setField('production_notes', e.target.value)}
                placeholder="Nhập ghi chú sản xuất"
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Section: Thông tin giá */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5">Thông tin giá</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Giá bán */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Giá bán <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={form.price}
                    onChange={e => setField('price', e.target.value)}
                    placeholder="0"
                    className={`w-full px-3 py-2.5 pr-8 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors ${
                      errors.price ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">đ</span>
                </div>
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
              </div>

              {/* Giá so sánh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá so sánh</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={form.compare_price}
                    onChange={e => setField('compare_price', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 pr-8 text-sm border border-gray-200 bg-gray-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">đ</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">Số tiền chưa giảm giá</p>
              </div>
            </div>

            {/* Giá vốn */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá vốn</label>
              <div className="relative w-1/2">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={form.cost_price}
                  onChange={e => setField('cost_price', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 pr-8 text-sm border border-gray-200 bg-gray-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">đ</span>
              </div>
            </div>

            {/* Computed metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Biên lợi nhuận:</p>
                <p className="text-sm font-semibold text-gray-700">{margin}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Lợi nhuận:</p>
                <p className="text-sm font-semibold text-gray-700">{profitDisp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ──────────────────────────────── */}
        <div className="space-y-6">

          {/* Section: Hình ảnh sản phẩm */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Hình ảnh sản phẩm</h2>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors min-h-[180px]"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="max-h-40 max-w-full rounded-lg object-contain"
                />
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                    <Upload size={22} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Kéo thả ảnh vào đây để tải lên
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Hoặc click để chọn ảnh
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImagePreview(null); imageFileRef.current = null }}
                className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Xoá ảnh
              </button>
            )}
          </div>

          {/* Section: Ghi chú */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Ghi chú</h2>
            <textarea
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder="Nhập ghi chú..."
              rows={5}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 mt-6 pb-2">
        <button
          type="button"
          onClick={requestCancel}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-60"
          style={{ backgroundColor: '#E67E22' }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Lưu
        </button>
      </div>

      {/* Success notification */}
      {showSuccess && (
        <SuccessModal
          message="Thêm sản phẩm thành công!"
          onClose={() => {
            setShowSuccess(false)
            onSaved(pendingSavedRef.current)
          }}
        />
      )}

      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCancelConfirm(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-[370px] max-w-[calc(100vw-2rem)] mx-4 px-5 pt-5 pb-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-yellow-400 flex items-center justify-center mb-4">
              <AlertTriangle size={18} className="text-yellow-400" />
            </div>
            <h3 className="text-[20px] leading-tight font-semibold italic text-gray-900 mb-6">
              Bạn có chắc muốn hủy biểu mẫu này?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onCancel}
                className="h-10 rounded-lg bg-[#F58232] hover:bg-[#E6772B] text-white text-[14px] font-bold leading-none whitespace-nowrap px-3 transition-colors"
              >
                Vâng, hủy đi
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="h-10 rounded-lg bg-[#FDF0E6] hover:bg-[#FBE5D4] text-[#F58232] text-[14px] font-semibold leading-none whitespace-nowrap px-3 transition-colors"
              >
                Không, quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
