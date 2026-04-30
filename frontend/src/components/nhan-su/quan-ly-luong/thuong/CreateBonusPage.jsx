import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronDown, RotateCcw, Loader2, Search, X } from 'lucide-react'
import api from '../../../../api/axios'
import SuccessModal from '../../../common/SuccessModal'

const EMPTY = {
  reason: '',
  bonus_date: '',
  amount_per_person: '',
  recipient_type: 'selected',
  bonus_type: 'direct',
  employee_ids: [],
  notes: '',
}

const inp = (err) =>
  `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white transition-colors ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'
  }`

const sel = (err) =>
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

const formatCurrencyInput = (val) => {
  const num = val.replace(/\D/g, '')
  return num ? new Intl.NumberFormat('vi-VN').format(parseInt(num)) : ''
}

export default function CreateBonusPage({ onCancel, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [savedData, setSavedData] = useState(null)

  // Employee search
  const [employees, setEmployees] = useState([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])

  // Amount display
  const [amountDisplay, setAmountDisplay] = useState('')

  useEffect(() => {
    api.get('employees/', { params: { status: 'working' } })
      .then(r => setEmployees(r.data.employees || []))
      .catch(() => {})
  }, [])

  const filteredEmployees = employees.filter(e =>
    !selectedEmployees.find(se => se.id === e.id) &&
    (e.full_name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    e.code.toLowerCase().includes(employeeSearch.toLowerCase()))
  )

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }))
  }

  const handleSelectEmployee = (emp) => {
    setSelectedEmployees([...selectedEmployees, emp])
    setField('employee_ids', [...form.employee_ids, emp.id])
    setEmployeeSearch('')
    setShowEmployeeDropdown(false)
  }

  const handleRemoveEmployee = (empId) => {
    setSelectedEmployees(selectedEmployees.filter(e => e.id !== empId))
    setField('employee_ids', form.employee_ids.filter(id => id !== empId))
  }

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setAmountDisplay(raw ? new Intl.NumberFormat('vi-VN').format(parseInt(raw)) : '')
    setField('amount_per_person', raw)
  }

  const validate = () => {
    const e = {}
    if (!form.reason.trim()) e.reason = 'Vui lòng nhập lý do thưởng.'
    if (!form.bonus_date) e.bonus_date = 'Vui lòng chọn ngày thưởng.'
    if (!form.amount_per_person || parseInt(form.amount_per_person) <= 0) e.amount_per_person = 'Vui lòng nhập mức thưởng hợp lệ.'
    if (form.recipient_type === 'selected' && form.employee_ids.length === 0) e.employee_ids = 'Vui lòng chọn ít nhất 1 nhân viên.'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    try {
      const payload = {
        reason: form.reason,
        bonus_date: form.bonus_date,
        amount_per_person: form.amount_per_person,
        recipient_type: form.recipient_type,
        bonus_type: form.bonus_type,
        employee_ids: form.recipient_type === 'all' ? [] : form.employee_ids,
        notes: form.notes,
      }
      const res = await api.post('bonuses/', payload)
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
    setAmountDisplay('')
    setSelectedEmployees([])
    setEmployeeSearch('')
  }

  return (
    <div className="min-h-full bg-[#FFF6F3] p-6" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
      {/* Back */}
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-3"
      >
        <ChevronLeft size={16} />
        Quay lại danh sách thưởng
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">THÊM MỚI THƯỞNG</h1>

      <div className="flex gap-5 items-start">
        {/* Left column - Thông tin chung */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Thông tin chung</h3>
            <div className="space-y-4">
              {/* Lý do thưởng */}
              <Field label="Lý do thưởng" required error={errors.reason}>
                <input
                  type="text"
                  placeholder="Nhập lý do thưởng"
                  value={form.reason}
                  onChange={e => setField('reason', e.target.value)}
                  className={inp(errors.reason)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                {/* Ngày thưởng */}
                <Field label="Ngày thưởng" required error={errors.bonus_date}>
                  <input
                    type="date"
                    value={form.bonus_date}
                    onChange={e => setField('bonus_date', e.target.value)}
                    className={inp(errors.bonus_date)}
                  />
                </Field>

                {/* Mức thưởng từng */}
                <Field label="Mức thưởng từng" required error={errors.amount_per_person}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0"
                      value={amountDisplay}
                      onChange={handleAmountChange}
                      className={inp(errors.amount_per_person)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">đ</span>
                  </div>
                </Field>
              </div>

              {/* Nhân viên được thưởng */}
              <Field label="Nhân viên được thưởng" required error={errors.employee_ids}>
                <SelectWrap>
                  <select
                    value={form.recipient_type}
                    onChange={e => {
                      setField('recipient_type', e.target.value)
                      if (e.target.value === 'all') {
                        setSelectedEmployees([])
                        setField('employee_ids', [])
                      }
                    }}
                    className={sel(errors.recipient_type)}
                  >
                    <option value="all">Tất cả nhân viên</option>
                    <option value="selected">Tùy chọn</option>
                  </select>
                </SelectWrap>
              </Field>

              {/* Employee selection - only show if recipient_type is 'selected' */}
              {form.recipient_type === 'selected' && (
                <div>
                  <div className="relative mb-2">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm nhân viên..."
                      value={employeeSearch}
                      onChange={e => {
                        setEmployeeSearch(e.target.value)
                        setShowEmployeeDropdown(true)
                      }}
                      onFocus={() => setShowEmployeeDropdown(true)}
                      onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-gray-50"
                    />
                    {showEmployeeDropdown && filteredEmployees.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                        {filteredEmployees.slice(0, 10).map(emp => (
                          <button
                            key={emp.id}
                            type="button"
                            onMouseDown={() => handleSelectEmployee(emp)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 transition-colors flex items-center justify-between"
                          >
                            <div>
                              <span className="font-medium text-gray-800">{emp.full_name}</span>
                              <span className="text-gray-400 ml-2 text-xs">{emp.code}</span>
                            </div>
                            <span className="text-xs text-gray-400">{emp.role}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected employees */}
                  {selectedEmployees.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployees.map(emp => (
                        <div
                          key={emp.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg text-sm"
                        >
                          <span className="font-medium text-gray-700">{emp.full_name}</span>
                          <span className="text-gray-400 text-xs">({emp.code})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmployee(emp.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Hình thức thưởng */}
              <Field label="Hình thức thưởng" required error={errors.bonus_type}>
                <SelectWrap>
                  <select
                    value={form.bonus_type}
                    onChange={e => setField('bonus_type', e.target.value)}
                    className={sel(errors.bonus_type)}
                  >
                    <option value="direct">Thưởng trực tiếp</option>
                    <option value="salary">Thưởng vào lương</option>
                  </select>
                </SelectWrap>
              </Field>
            </div>
          </div>
        </div>

        {/* Right column - Ghi chú */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Ghi chú</h3>
            <textarea
              placeholder="Nhập ghi chú..."
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              rows={8}
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
          onClick={onCancel}
          className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white"
        >
          Hủy bỏ
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: '#E67E22' }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Thêm
        </button>
      </div>

      {showSuccess && (
        <SuccessModal
          message="Thêm thưởng thành công!"
          onClose={() => {
            setShowSuccess(false)
            onSaved(savedData)
          }}
        />
      )}
    </div>
  )
}
