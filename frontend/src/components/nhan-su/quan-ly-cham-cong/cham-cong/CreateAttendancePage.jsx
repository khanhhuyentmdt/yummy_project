import { useState, useEffect } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import api from '../../../../api/axios'
import SuccessModal from '../../../common/SuccessModal'
import ConfirmCancelModal from '../../../common/ConfirmCancelModal'

const INIT = {
  employee:         '',
  work_shift:       '',
  attendance_date:  '',
  check_in_time:    '',
  check_out_time:   '',
  status:           'present',
  overtime_minutes: 0,
  notes:            '',
}

function inp(err) {
  return `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
    err ? 'border-red-400' : 'border-gray-200'
  }`
}

export default function CreateAttendancePage({ onBack, onSaved }) {
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

  function validate() {
    const errs = {}
    if (!form.employee)        errs.employee        = 'Vui lòng chọn nhân viên.'
    if (!form.attendance_date) errs.attendance_date = 'Vui lòng nhập ngày chấm công.'
    return errs
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = {
        employee:         parseInt(form.employee),
        work_shift:       form.work_shift ? parseInt(form.work_shift) : null,
        attendance_date:  form.attendance_date,
        check_in_time:    form.check_in_time || null,
        check_out_time:   form.check_out_time || null,
        status:           form.status,
        overtime_minutes: parseInt(form.overtime_minutes) || 0,
        notes:            form.notes,
      }
      const { data } = await api.post('/attendances/', payload)
      setSaved(true)
      setSuccessData(data)
    } catch (err) {
      const d = err.response?.data || {}
      const errs2 = {}
      for (const [k, v] of Object.entries(d)) {
        if (k === 'non_field_errors') {
          errs2.attendance_date = Array.isArray(v) ? v[0] : v
        } else {
          errs2[k] = Array.isArray(v) ? v[0] : v
        }
      }
      if (Object.keys(errs2).length) setErrors(errs2)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (saved) { onBack(); return }
    setShowCancel(true)
  }

  return (
    <div className="p-6 font-nunito-sans">
      <div className="text-sm text-gray-500 mb-1">
        Nhân sự &rsaquo; Quản lý chấm công &rsaquo; Chấm công &rsaquo;
        <span className="text-gray-800 font-semibold"> Thêm chấm công</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thêm chấm công</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
          <h2 className="font-semibold text-gray-700">Thông tin chấm công</h2>

          {/* Nhân viên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên <span className="text-red-500">*</span></label>
            <div className="relative">
              <select className={`${inp(errors.employee)} appearance-none pr-8`}
                value={form.employee} onChange={e => setField('employee', e.target.value)}>
                <option value="">-- Chọn nhân viên --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.code})</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.employee && <p className="text-red-500 text-xs mt-1">{errors.employee}</p>}
          </div>

          {/* Ca làm việc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm việc</label>
            <div className="relative">
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none appearance-none pr-8"
                value={form.work_shift} onChange={e => setField('work_shift', e.target.value)}>
                <option value="">-- Không chỉ định --</option>
                {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Ngày chấm công */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày chấm công <span className="text-red-500">*</span></label>
            <input type="date" className={inp(errors.attendance_date)}
              value={form.attendance_date} onChange={e => setField('attendance_date', e.target.value)} />
            {errors.attendance_date && <p className="text-red-500 text-xs mt-1">{errors.attendance_date}</p>}
          </div>

          {/* Giờ vào / Giờ ra */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ vào</label>
              <input type="time" className={inp()}
                value={form.check_in_time} onChange={e => setField('check_in_time', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ ra</label>
              <input type="time" className={inp()}
                value={form.check_out_time} onChange={e => setField('check_out_time', e.target.value)} />
            </div>
          </div>

          {/* Tăng ca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian tăng ca (phút)</label>
            <input type="number" min={0} className={inp()}
              value={form.overtime_minutes} onChange={e => setField('overtime_minutes', e.target.value)} />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea rows={3} className={inp()} placeholder="Nhập ghi chú..."
              value={form.notes} onChange={e => setField('notes', e.target.value)} />
          </div>
        </div>

        {/* Right — status */}
        <div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Trạng thái</h2>
            <div className="flex flex-col gap-2">
              {[
                ['present',     'Có mặt'],
                ['late',        'Đi trễ'],
                ['early_leave', 'Về sớm'],
                ['absent',      'Vắng mặt'],
                ['leave',       'Nghỉ phép'],
              ].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value={val}
                    checked={form.status === val} onChange={() => setField('status', val)}
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
        <button onClick={() => { setForm(INIT); setErrors({}) }}
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
        <SuccessModal message={`Đã tạo bản ghi chấm công ${successData.code} thành công!`}
          onClose={() => onSaved(successData)} />
      )}
      {showCancel && !saved && (
        <ConfirmCancelModal onConfirm={onBack} onCancel={() => setShowCancel(false)} />
      )}
    </div>
  )
}
