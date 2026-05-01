import { useState, useEffect, useRef } from 'react'
import { RotateCcw, Search, X, ChevronLeft } from 'lucide-react'
import api from '../../../../api/axios'
import ConfirmCancelModal from '../../../common/ConfirmCancelModal'

// ── Success overlay ───────────────────────────────────────────────────────────
function SuccessModal({ code, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ fontFamily: 'Nunito Sans, sans-serif' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 px-8 py-10 flex flex-col items-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: '#FFF0E6' }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 20l8 8 16-16" stroke="#E67E22" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-800 mb-2 text-center">
          Tạo bảng lương thành công!
        </p>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Mã bảng lương:{' '}
          <span className="font-semibold" style={{ color: '#E67E22' }}>{code}</span>
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 text-white font-bold rounded-[7px] hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#E67E22' }}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  )
}

// ── Stepper header ────────────────────────────────────────────────────────────
function Stepper({ step }) {
  const active = { backgroundColor: '#E67E22' }
  return (
    <div className="bg-white rounded-2xl shadow-sm px-8 py-5 mb-5 flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={step >= 1 ? { ...active, color: '#fff' } : { backgroundColor: '#e5e7eb', color: '#6b7280' }}
        >1</div>
        <span className={`text-sm font-semibold ${step === 1 ? 'text-gray-800' : 'text-gray-400'}`}>
          Thông tin chung
        </span>
      </div>
      <div
        className="flex-1 h-0.5 mx-2"
        style={step >= 2 ? active : { backgroundColor: '#e5e7eb' }}
      />
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={step >= 2 ? { ...active, color: '#fff' } : { backgroundColor: '#e5e7eb', color: '#6b7280' }}
        >2</div>
        <span className={`text-sm font-semibold ${step === 2 ? 'text-gray-800' : 'text-gray-400'}`}>
          Kiểm tra và lưu
        </span>
      </div>
    </div>
  )
}

function fmt(n) {
  if (!n && n !== 0) return '0'
  return Number(n).toLocaleString('vi-VN')
}

function Avatar({ emp }) {
  return emp.avatar_url ? (
    <img src={emp.avatar_url} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
  ) : (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ backgroundColor: '#FFF0E6', color: '#E67E22' }}
    >
      {(emp.full_name || '?')[0].toUpperCase()}
    </div>
  )
}

const INITIAL_FORM = { name: '', period: '', scope: '', notes: '' }

// ── Main component ────────────────────────────────────────────────────────────
export default function CreatePayrollPage({ onBack, onSaved }) {
  const [step, setStep]           = useState(1)
  const [form, setForm]           = useState(INITIAL_FORM)
  const [errors, setErrors]       = useState({})
  const [employees, setEmployees] = useState([])   // employees added to this payroll
  const [empSearch, setEmpSearch] = useState('')
  const [empResults, setEmpResults] = useState([])
  const [empLoading, setEmpLoading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false) // guard: don't show cancel after save
  const [showCancel, setShowCancel] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const searchTimer               = useRef(null)

  // Default period to current month
  useEffect(() => {
    const now = new Date()
    const mm   = String(now.getMonth() + 1).padStart(2, '0')
    const yyyy = now.getFullYear()
    setForm(f => ({ ...f, period: `${mm}/${yyyy}` }))
  }, [])

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  // Debounced employee search
  useEffect(() => {
    if (form.scope !== 'selected') { setEmpResults([]); return }
    clearTimeout(searchTimer.current)
    if (!empSearch.trim()) { setEmpResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setEmpLoading(true)
      try {
        const { data } = await api.get(
          `/employees/?status=working&search=${encodeURIComponent(empSearch)}`
        )
        const list     = data.employees || data.results || []
        const addedIds = new Set(employees.map(e => e.id))
        setEmpResults(list.filter(e => !addedIds.has(e.id)).slice(0, 10))
      } catch {
        setEmpResults([])
      } finally {
        setEmpLoading(false)
      }
    }, 300)
  }, [empSearch, form.scope, employees])

  function addEmployee(emp) {
    const baseSalary    = Number(emp.salary_amount)   || 0
    const benefitAmount = Number(emp.salary_allowance) || 0
    setEmployees(prev => [
      ...prev,
      {
        id:             emp.id,
        full_name:      emp.full_name,
        phone:          emp.phone,
        role:           emp.role,
        work_area_name: emp.work_area_name || '',
        avatar_url:     emp.avatar_url || '',
        base_salary:    baseSalary,
        work_days:      26,
        bonus_amount:   0,
        benefit_amount: benefitAmount,
        net_salary:     baseSalary + benefitAmount,
      },
    ])
    setEmpSearch('')
    setEmpResults([])
    setErrors(e => ({ ...e, scope: '' }))
  }

  function removeEmployee(id) {
    setEmployees(prev => prev.filter(e => e.id !== id))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim())  errs.name   = 'Vui lòng nhập tên bảng lương.'
    if (!form.period.trim()) errs.period = 'Vui lòng nhập kỳ tính lương.'
    else if (!/^\d{2}\/\d{4}$/.test(form.period.trim()))
      errs.period = 'Định dạng MM/YYYY (ví dụ: 03/2026).'
    if (!form.scope) errs.scope = 'Vui lòng chọn phạm vi áp dụng.'
    if (form.scope === 'selected' && employees.length === 0)
      errs.scope = 'Vui lòng chọn ít nhất 1 nhân viên.'
    return errs
  }

  async function handleNext() {
    if (step === 1) {
      const errs = validate()
      if (Object.keys(errs).length) { setErrors(errs); return }
      // For 'all' scope: fetch all working employees for preview
      if (form.scope === 'all' && employees.length === 0) {
        try {
          const { data } = await api.get('/employees/?status=working')
          const list = data.employees || data.results || []
          setEmployees(list.map(e => {
            const base    = Number(e.salary_amount)    || 0
            const benefit = Number(e.salary_allowance) || 0
            return {
              id: e.id, full_name: e.full_name, phone: e.phone,
              role: e.role, work_area_name: e.work_area_name || '',
              avatar_url: e.avatar_url || '',
              base_salary: base, work_days: 26, bonus_amount: 0,
              benefit_amount: benefit, net_salary: base + benefit,
            }
          }))
        } catch { /* preview stays empty */ }
      }
      setStep(2)
      return
    }
    // Step 2 → save
    await doSave('draft')
  }

  async function handleSaveDraft() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên bảng lương.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    await doSave('draft')
  }

  async function doSave(statusVal) {
    setSaving(true)
    try {
      // Send employee_data as a native array — NOT JSON.stringify
      const employeeData = employees.map(e => ({
        employee_id:    e.id,
        base_salary:    e.base_salary,
        work_days:      e.work_days,
        bonus_amount:   e.bonus_amount,
        benefit_amount: e.benefit_amount,
      }))

      const payload = {
        name:          form.name.trim(),
        period:        form.period.trim(),
        scope:         form.scope,
        notes:         form.notes,
        status:        statusVal,
        employee_ids:  employees.map(e => e.id),
        employee_data: employeeData,
      }

      const { data } = await api.post('/payrolls/', payload)
      setSaved(true)
      setSuccessData(data)
    } catch (err) {
      const resp = err?.response?.data || {}
      if (resp.name) {
        setErrors(e => ({ ...e, name: Array.isArray(resp.name) ? resp.name[0] : resp.name }))
      } else if (resp.period) {
        setErrors(e => ({ ...e, period: Array.isArray(resp.period) ? resp.period[0] : resp.period }))
      } else if (resp.non_field_errors) {
        setErrors(e => ({ ...e, name: Array.isArray(resp.non_field_errors) ? resp.non_field_errors[0] : resp.non_field_errors }))
      }
      setSaving(false)
    }
  }

  function handleReset() {
    const periodSnapshot = form.period
    setForm({ ...INITIAL_FORM, period: periodSnapshot })
    setEmployees([])
    setErrors({})
    setStep(1)
  }

  // "Hủy bỏ" / "Quay lại" — skip confirmation if already saved
  function handleCancel() {
    if (saved) { onBack(); return }
    setShowCancel(true)
  }

  const totalAmount = employees.reduce((s, e) => s + Number(e.net_salary || 0), 0)

  return (
    <div className="p-6 pb-28" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
      {/* Breadcrumb back */}
      <button
        onClick={handleCancel}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-4"
      >
        <ChevronLeft size={16} /> Quay lại danh sách bảng lương
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-5">THÊM MỚI BẢNG LƯƠNG</h1>

      <Stepper step={step} />

      {/* ── Step 1 ─────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex gap-5">
          {/* Left card */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-700 mb-5 pb-3 border-b border-gray-100">
              Thông tin chung
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Tên bảng lương */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tên bảng lương <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="Nhập tên bảng lương"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-orange-400 ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Kỳ tính lương */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Kỳ tính lương <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.period}
                  onChange={e => setField('period', e.target.value)}
                  placeholder="MM/YYYY"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-orange-400 ${
                    errors.period ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.period && (
                  <p className="text-red-500 text-xs mt-1">{errors.period}</p>
                )}
              </div>
            </div>

            {/* Phạm vi áp dụng */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phạm vi áp dụng <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.scope === 'all'}
                    onChange={() => { setField('scope', 'all'); setEmployees([]) }}
                    className="w-4 h-4 rounded border-gray-300 checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-700">Tất cả nhân viên</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.scope === 'selected'}
                    onChange={() => setField('scope', 'selected')}
                    className="w-4 h-4 rounded border-gray-300 checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-700">Tùy chọn</span>
                </label>
              </div>
              {errors.scope && (
                <p className="text-red-500 text-xs mt-1">{errors.scope}</p>
              )}
            </div>

            {/* Employee search & list — only when Tùy chọn */}
            {form.scope === 'selected' && (
              <div>
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={empSearch}
                    onChange={e => setEmpSearch(e.target.value)}
                    placeholder="Tìm kiếm nhân viên"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                  />
                  {empLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">…</span>
                  )}
                  {empResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto">
                      {empResults.map(emp => (
                        <button
                          key={emp.id}
                          onClick={() => addEmployee(emp)}
                          className="w-full text-left px-4 py-2.5 hover:bg-orange-50 text-sm border-b border-gray-50 last:border-0"
                        >
                          <span className="font-semibold text-gray-800">{emp.full_name}</span>
                          <span className="text-gray-400 ml-2 text-xs">
                            {emp.phone} · {emp.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {employees.length > 0 && (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-2 text-left text-xs font-semibold text-gray-400 w-10">STT</th>
                        <th className="pb-2 text-left text-xs font-semibold text-gray-400">NHÂN VIÊN</th>
                        <th className="pb-2 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, i) => (
                        <tr key={emp.id} className="border-b border-gray-50">
                          <td className="py-3 text-sm text-gray-500">{i + 1}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <Avatar emp={emp} />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{emp.full_name}</p>
                                <p className="text-xs text-gray-400">
                                  {emp.phone} · {emp.role}
                                  {emp.work_area_name ? ` · ${emp.work_area_name}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => removeEmployee(emp.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Right card — Ghi chú */}
          <div className="w-72">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Ghi chú</h3>
              <textarea
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                placeholder="Nhập ghi chú..."
                rows={7}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2 ─────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['STT', 'NHÂN VIÊN', 'LƯƠNG CƠ BẢN', 'THƯỞNG', 'PHÚC LỢI', 'LƯƠNG THỰC NHẬN', 'HÀNH ĐỘNG'].map(h => (
                  <th
                    key={h}
                    className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4 last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={emp.id} className="border-b border-gray-50">
                  <td className="py-4 pr-4 text-sm text-gray-500">{i + 1}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar emp={emp} />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{emp.full_name}</p>
                        <p className="text-xs text-gray-400">
                          {emp.phone} · {emp.role}
                          {emp.work_area_name ? ` · ${emp.work_area_name}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="text-sm font-semibold text-gray-800">{fmt(emp.base_salary)} đ</div>
                    <div className="text-xs text-gray-400">{emp.work_days} ngày công</div>
                  </td>
                  <td className="py-4 pr-4 text-sm text-gray-700">{fmt(emp.bonus_amount)} đ</td>
                  <td className="py-4 pr-4 text-sm text-gray-700">{fmt(emp.benefit_amount)} đ</td>
                  <td className="py-4 pr-4 text-sm font-semibold text-gray-800">{fmt(emp.net_salary)} đ</td>
                  <td className="py-4">
                    <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-100">
                <td colSpan={5} className="pt-4 text-right text-sm font-semibold text-gray-600 pr-4">
                  Tổng cộng:
                </td>
                <td className="pt-4 text-sm font-bold text-gray-800">
                  {fmt(totalAmount)} đ
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── Sticky footer ──────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 px-8 py-4 flex items-center justify-end gap-3"
        style={{ backgroundColor: '#FFF6F3' }}
      >
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="px-5 py-2.5 border border-orange-400 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 mr-auto"
          >
            Quay lại
          </button>
        )}
        <button
          onClick={handleReset}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
          title="Đặt lại"
        >
          <RotateCcw size={17} />
        </button>
        <button
          onClick={handleCancel}
          className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
        >
          Hủy bỏ
        </button>
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
        >
          Lưu nháp
        </button>
        <button
          onClick={handleNext}
          disabled={saving || Boolean(errors.name)}
          className="px-6 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-60 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#E67E22' }}
        >
          {saving ? 'Đang lưu...' : step === 1 ? 'Tiếp tục' : 'Lưu'}
        </button>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {successData && (
        <SuccessModal
          code={successData.code}
          onClose={() => onSaved(successData)}
        />
      )}
      {showCancel && !saved && (
        <ConfirmCancelModal
          onConfirm={onBack}
          onCancel={() => setShowCancel(false)}
        />
      )}
    </div>
  )
}
