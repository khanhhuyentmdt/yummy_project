import { useState, useEffect, useRef } from 'react'
import { RotateCcw, Search, X, ChevronDown, ChevronLeft } from 'lucide-react'
import api from '../../../../api/axios'
import ConfirmCancelModal from '../../../common/ConfirmCancelModal'

const STATUS_OPTS = [
  { value: 'draft',     label: 'Lưu nháp' },
  { value: 'paying',    label: 'Đang thanh toán' },
  { value: 'paid',      label: 'Đã thanh toán' },
  { value: 'cancelled', label: 'Đã hủy' },
]
const PAY_STATUS_OPTS = [
  { value: 'unpaid', label: 'Chưa thanh toán' },
  { value: 'paid',   label: 'Đã thanh toán' },
]

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

// ── Success overlay (stay-on-page) ────────────────────────────────────────────
function SuccessModal({ onClose }) {
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
        <p className="text-lg font-bold text-gray-800 mb-6 text-center">
          Cập nhật bảng lương thành công!
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 text-white font-bold rounded-[7px] hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#E67E22' }}
        >
          Xong
        </button>
      </div>
    </div>
  )
}

// ── Stepper (both steps shown as completed) ───────────────────────────────────
function Stepper() {
  const active = { backgroundColor: '#E67E22' }
  return (
    <div className="bg-white rounded-2xl shadow-sm px-8 py-5 mb-5 flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={active}
        >1</div>
        <span className="text-sm font-semibold text-gray-800">Thông tin chung</span>
      </div>
      <div className="flex-1 h-0.5 mx-2" style={active} />
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={active}
        >2</div>
        <span className="text-sm font-semibold text-gray-800">Kiểm tra và lưu</span>
      </div>
    </div>
  )
}

// Helper: build employee state from API PayrollEmployee entries
function entriesFromApi(apiEntries) {
  return (apiEntries || []).map(pe => ({
    id:             pe.employee_id,
    full_name:      pe.employee_name,
    phone:          pe.employee_phone,
    role:           pe.employee_role,
    work_area_name: pe.employee_work_area || '',
    avatar_url:     pe.avatar_url || '',
    base_salary:    pe.base_salary,
    work_days:      pe.work_days,
    bonus_amount:   pe.bonus_amount,
    benefit_amount: pe.benefit_amount,
    net_salary:     pe.net_salary,
    payment_status: pe.payment_status,
    pe_id:          pe.id,
  }))
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EditPayrollPage({ payroll: initialPayroll, onBack, onSaved }) {
  const [payroll, setPayroll]     = useState(initialPayroll)
  const [form, setForm]           = useState({
    name:   initialPayroll.name   || '',
    period: initialPayroll.period || '',
    scope:  initialPayroll.scope  || 'selected',
    notes:  initialPayroll.notes  || '',
    status: initialPayroll.status || 'draft',
  })
  const [employees, setEmployees] = useState(() => entriesFromApi(initialPayroll.employee_entries))
  const [errors, setErrors]       = useState({})
  const [empSearch, setEmpSearch] = useState('')
  const [empResults, setEmpResults] = useState([])
  const [empLoading, setEmpLoading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)   // guard cancel after save
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCancel, setShowCancel]   = useState(false)
  const [history, setHistory]         = useState(initialPayroll.history || [])
  const searchTimer               = useRef(null)

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  function setEmpPayStatus(empId, val) {
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, payment_status: val } : e))
  }

  function removeEmployee(empId) {
    setEmployees(prev => prev.filter(e => e.id !== empId))
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
    const base    = Number(emp.salary_amount)    || 0
    const benefit = Number(emp.salary_allowance) || 0
    setEmployees(prev => [
      ...prev,
      {
        id: emp.id, full_name: emp.full_name, phone: emp.phone,
        role: emp.role, work_area_name: emp.work_area_name || '',
        avatar_url: emp.avatar_url || '',
        base_salary: base, work_days: 26, bonus_amount: 0,
        benefit_amount: benefit, net_salary: base + benefit,
        payment_status: 'unpaid',
      },
    ])
    setEmpSearch('')
    setEmpResults([])
  }

  async function handleSave() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên bảng lương.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      // Send employee_data as a native array (NOT JSON.stringify'd)
      const employeeData = employees.map(e => ({
        employee_id:    e.id,
        base_salary:    e.base_salary,
        work_days:      e.work_days,
        bonus_amount:   e.bonus_amount,
        benefit_amount: e.benefit_amount,
        payment_status: e.payment_status,
      }))

      const payload = {
        name:          form.name.trim(),
        period:        form.period.trim(),
        scope:         form.scope,
        notes:         form.notes,
        status:        form.status,
        employee_ids:  employees.map(e => e.id),
        employee_data: employeeData,   // ← plain array, not stringified
      }

      const { data } = await api.patch(`/payrolls/${payroll.id}/`, payload)

      // Update local state from fresh response
      setPayroll(data)
      setHistory(data.history || [])
      setEmployees(entriesFromApi(data.employee_entries))
      setSaved(true)
      onSaved(data)
      setShowSuccess(true)
    } catch (err) {
      const resp = err?.response?.data || {}
      if (resp.name) {
        setErrors(e => ({ ...e, name: Array.isArray(resp.name) ? resp.name[0] : resp.name }))
      } else if (resp.non_field_errors) {
        setErrors(e => ({ ...e, name: Array.isArray(resp.non_field_errors) ? resp.non_field_errors[0] : resp.non_field_errors }))
      }
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setForm({
      name:   payroll.name   || '',
      period: payroll.period || '',
      scope:  payroll.scope  || 'selected',
      notes:  payroll.notes  || '',
      status: payroll.status || 'draft',
    })
    setEmployees(entriesFromApi(payroll.employee_entries))
    setErrors({})
    setSaved(false)
  }

  // "Hủy bỏ" — skip confirmation if already saved
  function handleCancel() {
    if (saved) { onBack(); return }
    setShowCancel(true)
  }

  const totalAmount = employees.reduce((s, e) => s + Number(e.net_salary || 0), 0)

  // History grouped by date
  const historyByDate = (history || []).reduce((acc, h) => {
    const d = new Date(h.timestamp).toLocaleDateString('vi-VN')
    if (!acc[d]) acc[d] = []
    acc[d].push(h)
    return acc
  }, {})

  return (
    <div className="p-6 pb-28" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
      {/* Breadcrumb */}
      <button
        onClick={handleCancel}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-4"
      >
        <ChevronLeft size={16} /> Quay lại danh sách bảng lương
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-5">
        CHỈNH SỬA BẢNG LƯƠNG {payroll.code}
      </h1>

      <Stepper />

      <div className="flex gap-5">
        {/* ── Left card ──────────────────────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-700 mb-5 pb-3 border-b border-gray-100">
            Thông tin chung
          </h2>

          {/* Tên + Kỳ */}
          <div className="grid grid-cols-2 gap-4 mb-5">
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
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kỳ tính lương <span className="text-red-500">*</span>
              </label>
              <input
                value={form.period}
                onChange={e => setField('period', e.target.value)}
                placeholder="MM/YYYY"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          {/* Phạm vi */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phạm vi áp dụng <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.scope === 'all'}
                  onChange={() => setField('scope', 'all')}
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
          </div>

          {/* Employee search — Tùy chọn only */}
          {form.scope === 'selected' && (
            <div className="relative mb-4">
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
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                  {empResults.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => addEmployee(emp)}
                      className="w-full text-left px-4 py-2.5 hover:bg-orange-50 text-sm border-b border-gray-50 last:border-0"
                    >
                      <span className="font-semibold text-gray-800">{emp.full_name}</span>
                      <span className="text-gray-400 ml-2 text-xs">{emp.phone} · {emp.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Employee table */}
          {employees.length > 0 && (
            <table className="w-full mb-3">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase w-10">STT</th>
                  <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase">NHÂN VIÊN</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-400 uppercase">LƯƠNG THỰC NHẬN</th>
                  <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase pl-3">TRẠNG THÁI</th>
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
                    <td className="py-3 text-right text-sm font-semibold text-gray-800 pr-3">
                      {fmt(emp.net_salary)} đ
                    </td>
                    <td className="py-3 pl-3">
                      <div className="relative">
                        <select
                          value={emp.payment_status}
                          onChange={e => setEmpPayStatus(emp.id, e.target.value)}
                          className="appearance-none pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 text-gray-700"
                        >
                          {PAY_STATUS_OPTS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td colSpan={2} className="pt-3 text-sm font-bold text-gray-700">TỔNG CỘNG</td>
                  <td className="pt-3 text-right text-sm font-bold text-gray-800 pr-3">
                    {fmt(totalAmount)} đ
                  </td>
                  <td className="pt-3 pl-3">
                    <div className="relative">
                      <select
                        value={form.status}
                        onChange={e => setField('status', e.target.value)}
                        className="appearance-none pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 text-gray-700"
                      >
                        {STATUS_OPTS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* ── Right cards ────────────────────────────────────────────────── */}
        <div className="w-72 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Ghi chú</h3>
            <textarea
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder="Nhập ghi chú..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-orange-400"
            />
          </div>

          {/* Audit trail */}
          {Object.keys(historyByDate).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Lịch sử</h3>
              {Object.entries(historyByDate).map(([date, items]) => (
                <div key={date} className="mb-4 last:mb-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{date}</p>
                  {items.map(h => (
                    <div key={h.id} className="flex items-start gap-2 mb-2">
                      <span className="mt-1 text-xs leading-none" style={{ color: '#E67E22' }}>•</span>
                      <div>
                        <p className="text-xs text-gray-700">{h.action}</p>
                        {h.actor_name && (
                          <p className="text-xs text-gray-400">{h.actor_name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky footer ──────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 px-8 py-4 flex items-center justify-end gap-3"
        style={{ backgroundColor: '#FFF6F3' }}
      >
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
          onClick={handleSave}
          disabled={saving || Boolean(errors.name)}
          className="px-6 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-60 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#E67E22' }}
        >
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showSuccess && (
        <SuccessModal onClose={() => setShowSuccess(false)} />
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
