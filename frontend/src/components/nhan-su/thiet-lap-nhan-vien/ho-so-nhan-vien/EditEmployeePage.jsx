import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronDown, RotateCcw, Loader2, Upload, UserCircle, FileText, History } from 'lucide-react'
import api from '../../../../api/axios'
import SuccessModal from '../../../common/SuccessModal'

const ROLES = [
  'Nhân viên thu mua', 'Nhân viên bếp', 'Nhân viên đóng gói', 'Nhân viên kho',
  'Nhân viên tài chính', 'Nhân viên bán hàng', 'Trợ lý sản xuất',
  'Chuyên viên nhân sự', 'Trợ lý nhân sự', 'Admin',
]
const SHIFTS  = ['Hành chính', 'Ca sáng', 'Ca chiều', 'Ca tối']
const GENDERS = [
  { value: 'male',   label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other',  label: 'Khác' },
]

const toForm = (emp) => ({
  full_name:        emp.full_name        || '',
  phone:            emp.phone            || '',
  work_area_id:     emp.work_area_id != null ? String(emp.work_area_id) : '',
  role:             emp.role             || '',
  shift:            emp.shift            || '',
  start_date:       emp.start_date       || '',
  date_of_birth:    emp.date_of_birth    || '',
  gender:           emp.gender           || '',
  id_number:        emp.id_number        || '',
  email:            emp.email            || '',
  address:          emp.address          || '',
  province:         emp.province         || '',
  district:         emp.district         || '',
  ward:             emp.ward             || '',
  notes:            emp.notes            || '',
  salary_base:      emp.salary_base      != null ? String(emp.salary_base)      : '',
  salary_allowance: emp.salary_allowance != null ? String(emp.salary_allowance) : '',
  status:           emp.status           || 'working',
})

const inp = (err) =>
  `w-full px-3 py-2.5 border rounded-[7px] text-sm focus:outline-none focus:ring-2 bg-white transition-colors ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'
  }`
const sel = (err) =>
  `w-full px-3 py-2.5 border rounded-[7px] text-sm focus:outline-none focus:ring-2 bg-white appearance-none transition-colors ${
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
function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-3 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  )
}

function groupByDate(history) {
  const map = {}
  history.forEach(h => {
    const d = new Date(h.timestamp)
    const key = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
    if (!map[key]) map[key] = []
    map[key].push(h)
  })
  return Object.entries(map)
}

export default function EditEmployeePage({ employeeId, onCancel, onSaved }) {
  const [empData, setEmpData]   = useState(null)
  const [form, setForm]         = useState({})
  const [originalForm, setOriginalForm] = useState({})
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)
  const [loadErr, setLoadErr]   = useState(false)
  const [locations, setLocations] = useState([])
  const [avatarPreview, setAvatarPreview]       = useState(null)
  const [avatarFile, setAvatarFile]             = useState(null)
  const [contractPreview, setContractPreview]   = useState(null)
  const [contractFile, setContractFile]         = useState(null)
  const [showSalary, setShowSalary] = useState(false)
  const [innerSuccess, setInnerSuccess] = useState(false)
  const avatarRef   = useRef(null)
  const contractRef = useRef(null)

  const loadEmployee = () => {
    api.get(`employees/${employeeId}/`)
      .then(r => {
        setEmpData(r.data)
        const f = toForm(r.data)
        setForm(f)
        setOriginalForm(f)
      })
      .catch(() => setLoadErr(true))
  }

  useEffect(() => {
    loadEmployee()
    api.get('locations/').then(r => setLocations(r.data.locations || [])).catch(() => {})
  }, [employeeId])

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }
  const handleContractChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setContractFile(file)
    setContractPreview(URL.createObjectURL(file))
  }
  const handleContractDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setContractFile(file)
    setContractPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const e = {}
    if (!form.full_name?.trim()) e.full_name = 'Vui lòng nhập họ và tên.'
    if (!form.phone?.trim())     e.phone     = 'Vui lòng nhập số điện thoại.'
    if (!form.role?.trim())      e.role      = 'Vui lòng chọn vai trò.'
    if (!form.shift?.trim())     e.shift     = 'Vui lòng chọn ca làm việc.'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) fd.append(k, v)
      })
      if (avatarFile)   fd.append('avatar', avatarFile)
      if (contractFile) fd.append('contract_image', contractFile)

      const res = await api.patch(`employees/${employeeId}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setEmpData(res.data)
      const f = toForm(res.data)
      setForm(f)
      setOriginalForm(f)
      setAvatarFile(null)
      setContractFile(null)
      if (onSaved) onSaved(res.data)
      setInnerSuccess(true)
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
    setForm(originalForm)
    setErrors({})
    setAvatarFile(null)
    setAvatarPreview(null)
    setContractFile(null)
    setContractPreview(null)
  }

  const fmtTime = (ts) => {
    const d = new Date(ts)
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  if (loadErr) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <p className="text-sm">Không thể tải dữ liệu nhân viên.</p>
      <button onClick={onCancel} className="mt-4 text-sm text-orange-500 hover:underline">Quay lại</button>
    </div>
  )
  if (!empData) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-orange-400" />
    </div>
  )

  const currentAvatar   = avatarPreview   || empData.avatar_url   || null
  const currentContract = contractPreview || empData.contract_image_url || null

  return (
    <div className="min-h-full">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-3"
      >
        <ChevronLeft size={16} />
        Quay lại danh sách hồ sơ nhân viên
      </button>
      <h1 className="text-xl font-bold text-gray-800 tracking-wide mb-6">
        CHỈNH SỬA HỒ SƠ — <span className="text-orange-500">{empData.code}</span>
      </h1>

      <div className="flex gap-5 items-start">
        {/* ── Left column ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Thông tin khởi tạo */}
          <SectionCard title="Thông tin khởi tạo">
            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div
                  className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer relative group"
                  onClick={() => avatarRef.current?.click()}
                >
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={48} className="text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="flex-1 space-y-4">
                <Field label="Họ và tên nhân viên" required error={errors.full_name}>
                  <input type="text" placeholder="Nhập họ và tên" value={form.full_name||''} onChange={e => setField('full_name', e.target.value)} className={inp(errors.full_name)} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Số điện thoại" required error={errors.phone}>
                    <input type="text" value={form.phone||''} onChange={e => setField('phone', e.target.value)} className={inp(errors.phone)} />
                  </Field>
                  <Field label="Khu vực làm việc" error={errors.work_area_id}>
                    <SelectWrap>
                      <select value={form.work_area_id||''} onChange={e => setField('work_area_id', e.target.value)} className={sel(errors.work_area_id)}>
                        <option value="">Chọn khu vực làm việc</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </SelectWrap>
                  </Field>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Thông tin công việc */}
          <SectionCard title="Thông tin công việc">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ngày vào làm" error={errors.start_date}>
                  <input type="date" value={form.start_date||''} onChange={e => setField('start_date', e.target.value)} className={inp(errors.start_date)} />
                </Field>
                <Field label="Vai trò" required error={errors.role}>
                  <SelectWrap>
                    <select value={form.role||''} onChange={e => setField('role', e.target.value)} className={sel(errors.role)}>
                      <option value="">Chọn vai trò</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ca làm việc" required error={errors.shift}>
                  <SelectWrap>
                    <select value={form.shift||''} onChange={e => setField('shift', e.target.value)} className={sel(errors.shift)}>
                      <option value="">Chọn ca làm việc</option>
                      {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Trạng thái" error={errors.status}>
                  <SelectWrap>
                    <select value={form.status||'working'} onChange={e => setField('status', e.target.value)} className={sel(errors.status)}>
                      <option value="working">Đang làm việc</option>
                      <option value="stopped">Ngưng làm việc</option>
                    </select>
                  </SelectWrap>
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* Thông tin cá nhân */}
          <SectionCard title="Thông tin cá nhân">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ngày sinh"><input type="date" value={form.date_of_birth||''} onChange={e => setField('date_of_birth', e.target.value)} className={inp()} /></Field>
                <Field label="Giới tính">
                  <SelectWrap>
                    <select value={form.gender||''} onChange={e => setField('gender', e.target.value)} className={sel()}>
                      <option value="">Chọn giới tính</option>
                      {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Số CMND/ CCCD" error={errors.id_number}><input type="text" value={form.id_number||''} onChange={e => setField('id_number', e.target.value)} className={inp(errors.id_number)} /></Field>
                <Field label="Email" error={errors.email}><input type="email" value={form.email||''} onChange={e => setField('email', e.target.value)} className={inp(errors.email)} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Địa chỉ"><input type="text" value={form.address||''} onChange={e => setField('address', e.target.value)} className={inp()} /></Field>
                <Field label="Tỉnh/ Thành phố"><input type="text" value={form.province||''} onChange={e => setField('province', e.target.value)} className={inp()} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Quận/ Huyện"><input type="text" value={form.district||''} onChange={e => setField('district', e.target.value)} className={inp()} /></Field>
                <Field label="Phường/ Xã"><input type="text" value={form.ward||''} onChange={e => setField('ward', e.target.value)} className={inp()} /></Field>
              </div>
            </div>
          </SectionCard>

          {/* Lương thưởng */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button type="button" onClick={() => setShowSalary(v => !v)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <span className="text-sm font-semibold text-gray-700">Lương thưởng</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showSalary ? 'rotate-180' : ''}`} />
            </button>
            {showSalary && (
              <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Lương cơ bản (VNĐ)"><input type="number" value={form.salary_base||''} onChange={e => setField('salary_base', e.target.value)} className={inp()} /></Field>
                  <Field label="Phụ cấp (VNĐ)"><input type="number" value={form.salary_allowance||''} onChange={e => setField('salary_allowance', e.target.value)} className={inp()} /></Field>
                </div>
              </div>
            )}
          </div>

          {/* Audit Trail */}
          {empData.history?.length > 0 && (
            <SectionCard title="Lịch sử chỉnh sửa">
              <div className="space-y-4">
                {groupByDate(empData.history).map(([date, items]) => (
                  <div key={date}>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">{date}</p>
                    <div className="space-y-2">
                      {items.map(h => (
                        <div key={h.id} className="flex items-start gap-3">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-gray-600">{h.actor_name}</span>
                            <span className="text-xs text-gray-400 mx-1">·</span>
                            <span className="text-xs text-gray-500">{h.action}</span>
                            <span className="text-xs text-gray-300 ml-2">{fmtTime(h.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Right column ─────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 space-y-5">
          <SectionCard title="Hợp đồng">
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors bg-gray-50"
              onClick={() => contractRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleContractDrop}
            >
              {currentContract ? (
                <img src={currentContract} alt="" className="w-full h-40 object-contain rounded-lg" />
              ) : (
                <div className="py-6">
                  <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Kéo thả hoặc tải ảnh lên từ thiết bị.<br />
                    Chỉ chấp nhận *.png, *.jpg và *.jpeg.
                  </p>
                </div>
              )}
            </div>
            <input ref={contractRef} type="file" accept="image/*" className="hidden" onChange={handleContractChange} />
          </SectionCard>

          <SectionCard title="Ghi chú">
            <textarea
              value={form.notes||''}
              onChange={e => setField('notes', e.target.value)}
              rows={5}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-[7px] text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white resize-none"
              placeholder="Nhập ghi chú..."
            />
          </SectionCard>
        </div>
      </div>

      {/* ── Footer ────────────────────────────── */}
      <div className="mt-6 flex items-center justify-end gap-3 bg-[#FFF6F3] py-4 rounded-xl px-2">
        <button onClick={handleReset} className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors" title="Đặt lại">
          <RotateCcw size={18} />
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 border border-gray-200 rounded-[7px] text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white">
          Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-[7px] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: '#E67E22' }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Lưu
        </button>
      </div>

      {innerSuccess && (
        <SuccessModal
          message={`Thông tin nhân viên "${empData.full_name}" đã được cập nhật!`}
          onClose={() => setInnerSuccess(false)}
        />
      )}
    </div>
  )
}
