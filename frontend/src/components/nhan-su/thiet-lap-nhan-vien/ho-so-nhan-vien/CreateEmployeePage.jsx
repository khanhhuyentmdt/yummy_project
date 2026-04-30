import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronDown, RotateCcw, Loader2, Upload, UserCircle, FileText, X, Search } from 'lucide-react'
import api from '../../../../api/axios'
import SuccessModal from '../../../common/SuccessModal'

const ROLES = [
  'Nhân viên thu mua', 'Nhân viên bếp', 'Nhân viên đóng gói', 'Nhân viên kho',
  'Nhân viên tài chính', 'Nhân viên bán hàng', 'Trợ lý sản xuất',
  'Chuyên viên nhân sự', 'Trợ lý nhân sự', 'Admin',
]
const SHIFTS = ['Hành chính', 'Ca sáng', 'Ca chiều', 'Ca tối']
const GENDERS = [
  { value: 'male',   label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other',  label: 'Khác' },
]

const EMPTY = {
  full_name: '', phone: '', work_area_id: '',
  role: '', shift: '', start_date: '',
  date_of_birth: '', gender: '',
  id_number: '', email: '', address: '',
  province_code: '', district_code: '', ward_code: '',
  notes: '',
  has_salary_info: false,
  salary_type_id: '',
  salary_amount: '',
  benefits_ids: [],
  status: 'working',
}

const inp = (err) =>
  `w-full px-3 py-2.5 border rounded-[7px] text-sm focus:outline-none focus:ring-2 bg-white transition-colors ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'
  }`

const sel = (err) =>
  `w-full px-3 py-2.5 border rounded-[7px] text-sm focus:outline-none focus:ring-2 bg-white appearance-none transition-colors ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'
  }`

// Custom checkbox style
const checkboxStyle = `
  input[type="checkbox"]:checked {
    background-color: #E67E22;
    border-color: #E67E22;
  }
`

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

export default function CreateEmployeePage({ onCancel, onSaved }) {
  const [form, setForm]         = useState(EMPTY)
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)
  const [locations, setLocations] = useState([])
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile]       = useState(null)
  const [contractPreview, setContractPreview] = useState(null)
  const [contractFile, setContractFile]       = useState(null)
  const [successData, setSuccessData] = useState(null)
  const avatarRef   = useRef(null)
  const contractRef = useRef(null)

  // Vietnam Location states
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  // Salary & Benefits states
  const [salaryTypes, setSalaryTypes] = useState([])
  const [allBenefits, setAllBenefits] = useState([])
  const [selectedBenefits, setSelectedBenefits] = useState([])
  const [benefitSearch, setBenefitSearch] = useState('')

  useEffect(() => {
    // Load locations
    api.get('locations/').then(r => setLocations(r.data.locations || [])).catch(() => {})
    
    // Load provinces
    api.get('provinces/').then(r => setProvinces(r.data.provinces || [])).catch(() => {})
    
    // Load salary types
    api.get('salary-types/').then(r => setSalaryTypes(r.data.salary_types || [])).catch(() => {})
    
    // Load benefits
    api.get('benefits-policies/').then(r => setAllBenefits(r.data.benefits || [])).catch(() => {})
  }, [])

  // Load districts when province changes
  useEffect(() => {
    if (form.province_code) {
      api.get(`districts/?province_code=${form.province_code}`)
        .then(r => {
          setDistricts(r.data.districts || [])
          setWards([])
        })
        .catch(() => {})
    } else {
      setDistricts([])
      setWards([])
    }
  }, [form.province_code])

  // Load wards when district changes
  useEffect(() => {
    if (form.district_code) {
      api.get(`wards/?district_code=${form.district_code}`)
        .then(r => setWards(r.data.wards || []))
        .catch(() => {})
    } else {
      setWards([])
    }
  }, [form.district_code])

  const setField = (k, v) => {
    setForm(f => {
      const newForm = { ...f, [k]: v }
      
      // Reset dependent fields when parent changes
      if (k === 'province_code') {
        newForm.district_code = ''
        newForm.ward_code = ''
      } else if (k === 'district_code') {
        newForm.ward_code = ''
      }
      
      return newForm
    })
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }))
  }

  const handleAddBenefit = (benefit) => {
    if (!selectedBenefits.find(b => b.id === benefit.id)) {
      setSelectedBenefits([...selectedBenefits, benefit])
      setForm(f => ({ ...f, benefits_ids: [...f.benefits_ids, benefit.id] }))
    }
    setBenefitSearch('')
  }

  const handleRemoveBenefit = (benefitId) => {
    setSelectedBenefits(selectedBenefits.filter(b => b.id !== benefitId))
    setForm(f => ({ ...f, benefits_ids: f.benefits_ids.filter(id => id !== benefitId) }))
  }

  const filteredBenefits = allBenefits.filter(b => 
    !selectedBenefits.find(sb => sb.id === b.id) &&
    (b.name.toLowerCase().includes(benefitSearch.toLowerCase()) ||
     b.code.toLowerCase().includes(benefitSearch.toLowerCase()))
  )

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
    if (!form.full_name.trim()) e.full_name = 'Vui lòng nhập họ và tên.'
    if (!form.phone.trim())     e.phone     = 'Vui lòng nhập số điện thoại.'
    if (!form.role.trim())      e.role      = 'Vui lòng chọn vai trò.'
    if (!form.shift.trim())     e.shift     = 'Vui lòng chọn ca làm việc.'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'benefits_ids') {
          // Send as JSON array
          fd.append(k, JSON.stringify(v))
        } else if (v !== '' && v !== null && v !== undefined) {
          fd.append(k, v)
        }
      })
      if (avatarFile)   fd.append('avatar', avatarFile)
      if (contractFile) fd.append('contract_image', contractFile)

      const res = await api.post('employees/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccessData(res.data)
    } catch (err) {
      const data = err.response?.data || {}
      const mapped = {}
      Object.entries(data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
      setErrors(mapped)
    } finally {
      setSaving(false)
    }
  }

  const handleSuccessClose = () => {
    // Chuyển sang trang Edit với employee ID
    onSaved(successData)
  }

  const handleReset = () => {
    setForm(EMPTY)
    setErrors({})
    setAvatarPreview(null)
    setAvatarFile(null)
    setContractPreview(null)
    setContractFile(null)
    setSelectedBenefits([])
    setBenefitSearch('')
  }

  return (
    <div className="min-h-full">
      <style>{checkboxStyle}</style>
      {/* Back + Title */}
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-3"
      >
        <ChevronLeft size={16} />
        Quay lại danh sách hồ sơ nhân viên
      </button>
      <h1 className="text-xl font-bold text-gray-800 tracking-wide mb-6">THÊM MỚI HỒ SƠ NHÂN VIÊN</h1>

      <div className="flex gap-5 items-start">
        {/* ── Left column ───────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Thông tin khởi tạo */}
          <SectionCard title="Thông tin khởi tạo">
            <div className="flex gap-5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div
                  className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer relative group"
                  onClick={() => avatarRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={48} className="text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-4">
                <Field label="Họ và tên nhân viên" required error={errors.full_name}>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên nhân viên"
                    value={form.full_name}
                    onChange={e => setField('full_name', e.target.value)}
                    className={inp(errors.full_name)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Số điện thoại" required error={errors.phone}>
                    <input
                      type="text"
                      placeholder="Nhập số điện thoại"
                      value={form.phone}
                      onChange={e => setField('phone', e.target.value)}
                      className={inp(errors.phone)}
                    />
                  </Field>
                <Field label="Khu vực làm việc" error={errors.work_area_id}>
                  <SelectWrap>
                    <select
                      value={form.work_area_id}
                      onChange={e => setField('work_area_id', e.target.value)}
                      className={sel(errors.work_area_id)}
                    >
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
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setField('start_date', e.target.value)}
                    className={inp(errors.start_date)}
                  />
                </Field>
                <Field label="Vai trò" required error={errors.role}>
                  <SelectWrap>
                    <select value={form.role} onChange={e => setField('role', e.target.value)} className={sel(errors.role)}>
                      <option value="">Chọn vai trò</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ca làm việc" required error={errors.shift}>
                  <SelectWrap>
                    <select value={form.shift} onChange={e => setField('shift', e.target.value)} className={sel(errors.shift)}>
                      <option value="">Chọn ca làm việc</option>
                      {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
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
                <Field label="Ngày sinh" error={errors.date_of_birth}>
                  <input type="date" value={form.date_of_birth} onChange={e => setField('date_of_birth', e.target.value)} className={inp(errors.date_of_birth)} />
                </Field>
                <Field label="Giới tính" error={errors.gender}>
                  <SelectWrap>
                    <select value={form.gender} onChange={e => setField('gender', e.target.value)} className={sel(errors.gender)}>
                      <option value="">Chọn giới tính</option>
                      {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Số CMND/ CCCD" error={errors.id_number}>
                  <input type="text" placeholder="Nhập số CMND/ CCCD" value={form.id_number} onChange={e => setField('id_number', e.target.value)} className={inp(errors.id_number)} />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input type="email" placeholder="Nhập email" value={form.email} onChange={e => setField('email', e.target.value)} className={inp(errors.email)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Địa chỉ" error={errors.address}>
                  <input type="text" placeholder="Nhập địa chỉ" value={form.address} onChange={e => setField('address', e.target.value)} className={inp(errors.address)} />
                </Field>
                <Field label="Tỉnh/ Thành phố" error={errors.province_code}>
                  <SelectWrap>
                    <select value={form.province_code} onChange={e => setField('province_code', e.target.value)} className={sel(errors.province_code)}>
                      <option value="">Chọn tỉnh/ thành phố</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Quận/ Huyện" error={errors.district_code}>
                  <SelectWrap>
                    <select 
                      value={form.district_code} 
                      onChange={e => setField('district_code', e.target.value)} 
                      className={sel(errors.district_code)}
                      disabled={!form.province_code}
                    >
                      <option value="">Chọn quận/ huyện</option>
                      {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Phường/ Xã" error={errors.ward_code}>
                  <SelectWrap>
                    <select 
                      value={form.ward_code} 
                      onChange={e => setField('ward_code', e.target.value)} 
                      className={sel(errors.ward_code)}
                      disabled={!form.district_code}
                    >
                      <option value="">Chọn phường/ xã</option>
                      {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* Lương thưởng */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="has_salary_info"
                checked={form.has_salary_info}
                onChange={e => setField('has_salary_info', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-orange-200"
                style={{
                  accentColor: '#E67E22',
                  cursor: 'pointer',
                }}
              />
              <label htmlFor="has_salary_info" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Lương thưởng
              </label>
            </div>

            {form.has_salary_info && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Loại lương" error={errors.salary_type_id}>
                    <SelectWrap>
                      <select
                        value={form.salary_type_id}
                        onChange={e => setField('salary_type_id', e.target.value)}
                        className={sel(errors.salary_type_id)}
                      >
                        <option value="">Chọn loại lương</option>
                        {salaryTypes.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </SelectWrap>
                  </Field>
                  <Field label="Mức lương" error={errors.salary_amount}>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0"
                        value={form.salary_amount}
                        onChange={e => setField('salary_amount', e.target.value)}
                        className={inp(errors.salary_amount)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        đ/kỳ lương
                      </span>
                    </div>
                  </Field>
                </div>

                {/* Phúc lợi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phúc lợi</label>
                  
                  {/* Search box */}
                  <div className="relative mb-3">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm chính sách phúc lợi"
                      value={benefitSearch}
                      onChange={e => setBenefitSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-[7px] text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                    
                    {/* Dropdown results */}
                    {benefitSearch && filteredBenefits.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-[7px] shadow-lg max-h-48 overflow-y-auto">
                        {filteredBenefits.slice(0, 10).map(benefit => (
                          <button
                            key={benefit.id}
                            type="button"
                            onClick={() => handleAddBenefit(benefit)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 transition-colors flex items-center justify-between"
                          >
                            <span>
                              <span className="font-medium text-gray-700">{benefit.code}</span>
                              <span className="text-gray-500 ml-2">— {benefit.name}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected benefits table */}
                  {selectedBenefits.length > 0 && (
                    <div className="border border-gray-200 rounded-[7px] overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">MÃ CS</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">TÊN CHÍNH SÁCH</th>
                            <th className="px-3 py-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedBenefits.map(benefit => (
                            <tr key={benefit.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-700">{benefit.code}</td>
                              <td className="px-3 py-2 text-gray-600">{benefit.name}</td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBenefit(benefit.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ──────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 space-y-5">
          {/* Hợp đồng */}
          <SectionCard title="Hợp đồng">
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors bg-gray-50"
              onClick={() => contractRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleContractDrop}
            >
              {contractPreview ? (
                <img src={contractPreview} alt="" className="w-full h-40 object-contain rounded-lg" />
              ) : (
                <div className="py-6">
                  <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Kéo thả hoặc tải ảnh lên từ thiết bị.<br />
                    Chỉ chấp nhận tệp hình ảnh *.png, *.jpg và *.jpeg.
                  </p>
                </div>
              )}
            </div>
            <input ref={contractRef} type="file" accept="image/*" className="hidden" onChange={handleContractChange} />
          </SectionCard>

          {/* Ghi chú */}
          <SectionCard title="Ghi chú">
            <textarea
              placeholder="Nhập ghi chú..."
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              rows={5}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-[7px] text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white resize-none"
            />
          </SectionCard>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
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
          Thêm
        </button>
      </div>

      {successData && (
        <SuccessModal
          message={`Nhân viên "${successData.full_name}" đã được thêm thành công!`}
          onClose={handleSuccessClose}
        />
      )}
    </div>
  )
}
