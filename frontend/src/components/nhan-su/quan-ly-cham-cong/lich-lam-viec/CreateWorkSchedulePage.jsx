import { useState, useEffect } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import api from '../../../../api/axios'
import SuccessModal from '../../../common/SuccessModal'
import ConfirmCancelModal from '../../../common/ConfirmCancelModal'

const DAYS = [
  { val: '1', label: 'Thứ 2' },
  { val: '2', label: 'Thứ 3' },
  { val: '3', label: 'Thứ 4' },
  { val: '4', label: 'Thứ 5' },
  { val: '5', label: 'Thứ 6' },
  { val: '6', label: 'Thứ 7' },
  { val: '7', label: 'Chủ nhật' },
]

const INIT = {
  employee: '',
  work_shift: '',
  start_date: '',
  end_date: '',
  repeat_type: 'weekly',
  days_of_week: ['1', '2', '3', '4', '5'],
  notes: '',
  status: 'active',
}

function inp(err) {
  return `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
    err ? 'border-red-400' : 'border-gray-200'
  }`
}

export default function CreateWorkSchedulePage({ onBack, onSaved }) {
  const [form,        setForm]       = useState(INIT)
  const [errors,      setErrors]     = useState({})
  const [employees,   setEmployees]  = useState([])
  const [shifts,      setShifts]     = useState([])
  const [saving,      setSaving]     = useState(false)
  const [saved,       setSaved]      = useState(false)
  const [successData, setSuccessData]= useState(null)
  const [showCancel,  setShowCancel] = useState(false)

  useEffect(() => {
    api.get('/employees/?status=working').then(r => setEmployees(r.data.employees || r.data.results || []))
    api.get('/shifts/?status=active').then(r => setShifts(r.data.shifts || []))
  }, [])

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function toggleDay(d) {
    setForm(f => {
      const cur = f.days_of_week
      return {
        ...f,
        days_of_week: cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d].sort(),
      }
    })
  }

  function validate() {
    const errs = {}
    if (!form.employee)   errs.employee   = 'Vui lòng chọn nhân viên.'
    if (!form.start_date) errs.start_date = 'Vui lòng nhập ngày bắt đầu.'
    if (form.repeat_type === 'weekly' && form.days_of_week.length === 0)
      errs.days_of_week = 'Vui lòng chọn ít nhất một ngày trong tuần.'
    return errs
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = {
        employee:     parseInt(form.employee),
        work_shift:   form.work_shift ? parseInt(form.work_shift) : null,
        start_date:   form.start_date,
        end_date:     form.end_date || null,
        repeat_type:  form.repeat_type,
        days_of_week: form.repeat_type === 'weekly' ? form.days_of_week.join(',') : '',
        notes:        form.notes,
        status:       form.status,
      }
      const { data } = await api.post('/schedules/', payload)
      setSaved(true)
      setSuccessData(data)
    } catch (err) {
      const d = err.response?.data || {}
      const errs2 = {}
      for (const [k, v] of Object.entries(d)) errs2[k] = Array.isArray(v) ? v[0] : v
      if (Object.keys(errs2).length) setErrors(errs2)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (saved) { onBack(); return }
    setShowCancel(true)
  }

  function handleReset() {
    setForm(INIT)
    setErrors({})
    setSaved(false)
    setSuccessData(null)
  }

  return (
    <div className="p-6 font-nunito-sans">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-1">
        Nhân sự &rsaquo; Quản lý chấm công &rsaquo; Lịch làm việc &rsaquo;
        <span className="text-gray-800 font-semibold"> Thêm lịch làm việc</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thêm lịch làm việc</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
          <h2 className="font-semibold text-gray-700">Thông tin lịch làm việc</h2>

          {/* Nhân viên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên <span className="text-red-500">*</span></label>
            <div className="relative">
              <select className={`${inp(errors.employee)} appearance-none pr-8`}
                value={form.employee} onChange={e => setField('employee', e.target.value)}>
                <option value="">-- Chọn nhân viên --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.full_name} ({e.code})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.employee && <p className="text-red-500 text-xs mt-1">{errors.employee}</p>}
          </div>

          {/* Ca làm việc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm việc</label>
            <div className="relative">
              <select className={`${inp()} appearance-none pr-8`}
                value={form.work_shift} onChange={e => setField('work_shift', e.target.value)}>
                <option value="">-- Không chỉ định --</option>
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Ngày bắt đầu / Ngày kết thúc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
              <input type="date" className={inp(errors.start_date)}
                value={form.start_date} onChange={e => setField('start_date', e.target.value)} />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input type="date" className={inp()}
                value={form.end_date} onChange={e => setField('end_date', e.target.value)} />
            </div>
          </div>

          {/* Kiểu lặp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kiểu lặp</label>
            <div className="flex gap-4">
              {[['once', 'Một lần'], ['weekly', 'Hằng tuần'], ['monthly', 'Hằng tháng']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="repeat_type" value={val}
                    checked={form.repeat_type === val}
                    onChange={() => setField('repeat_type', val)}
                    className="accent-[#E67E22]" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ngày trong tuần (weekly only) */}
          {form.repeat_type === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày trong tuần</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(d => (
                  <label key={d.val}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-sm select-none transition-colors ${
                      form.days_of_week.includes(d.val)
                        ? 'border-[#E67E22] bg-orange-50 text-[#E67E22] font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-orange-300'
                    }`}>
                    <input type="checkbox" className="hidden" checked={form.days_of_week.includes(d.val)}
                      onChange={() => toggleDay(d.val)} />
                    {d.label}
                  </label>
                ))}
              </div>
              {errors.days_of_week && <p className="text-red-500 text-xs mt-1">{errors.days_of_week}</p>}
            </div>
          )}

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea rows={3} className={inp()}
              placeholder="Nhập ghi chú..."
              value={form.notes} onChange={e => setField('notes', e.target.value)} />
          </div>
        </div>

        {/* Right panel — status */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Trạng thái</h2>
            <div className="flex flex-col gap-2">
              {[['active', 'Đang hoạt động'], ['inactive', 'Ngưng hoạt động']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value={val}
                    checked={form.status === val}
                    onChange={() => setField('status', val)}
                    className="accent-[#E67E22]" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <RotateCcw size={14} /> Đặt lại
        </button>
        <button onClick={handleCancel}
          className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Hủy bỏ
        </button>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2 bg-[#E67E22] hover:bg-orange-600 text-white font-semibold rounded-lg text-sm disabled:opacity-60">
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      {successData && (
        <SuccessModal
          message={`Đã tạo lịch làm việc ${successData.code} thành công!`}
          onClose={() => onSaved(successData)}
        />
      )}
      {showCancel && !saved && (
        <ConfirmCancelModal onConfirm={onBack} onCancel={() => setShowCancel(false)} />
      )}
    </div>
  )
}
