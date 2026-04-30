import { useState, useEffect } from 'react'
import { X, RotateCcw, Plus, Trash2, Loader2 } from 'lucide-react'
import api from '../../../../api/axios'
import { parseTimeWithAMPM, calculateWorkingHoursDisplay } from '../../../../utils/timeUtils'

const EMPTY_FORM = {
  name:       '',
  start_time: '',
  end_time:   '',
  status:     'active',
}

const inp = (err) =>
  `w-full px-3 py-2.5 border rounded-[7px] text-sm focus:outline-none focus:ring-2 bg-white transition-colors ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'
  }`

function Field({ label, required, children, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function AddShiftModal({ onClose, onCreated }) {
  const [form,    setForm]    = useState(EMPTY_FORM)
  const [breaks,  setBreaks]  = useState([])
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [totalHours, setTotalHours] = useState('0 giờ')

  // Calculate total hours whenever form or breaks change
  useEffect(() => {
    if (form.start_time && form.end_time) {
      const display = calculateWorkingHoursDisplay(form.start_time, form.end_time, breaks)
      setTotalHours(display)
    } else {
      setTotalHours('0 giờ')
    }
  }, [form.start_time, form.end_time, breaks])

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  function addBreak() {
    setBreaks(prev => [...prev, { break_start: '', break_end: '' }])
  }

  function updateBreak(idx, key, value) {
    setBreaks(prev => prev.map((b, i) => i === idx ? { ...b, [key]: value } : b))
  }

  function removeBreak(idx) {
    setBreaks(prev => prev.filter((_, i) => i !== idx))
  }

  function reset() {
    setForm(EMPTY_FORM)
    setBreaks([])
    setErrors({})
  }

  function validate() {
    const e = {}
    if (!form.name.trim())       e.name       = 'Vui lòng nhập tên ca làm việc.'
    if (!form.start_time)        e.start_time = 'Vui lòng chọn giờ bắt đầu.'
    if (!form.end_time)          e.end_time   = 'Vui lòng chọn giờ kết thúc.'
    breaks.forEach((b, i) => {
      if (!b.break_start) e[`break_start_${i}`] = 'Chưa chọn giờ.'
      if (!b.break_end)   e[`break_end_${i}`]   = 'Chưa chọn giờ.'
    })
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    try {
      // Parse AM/PM format to 24-hour format before sending to backend
      const payload = {
        name:       form.name.trim(),
        start_time: parseTimeWithAMPM(form.start_time),
        end_time:   parseTimeWithAMPM(form.end_time),
        status:     form.status,
        breaks:     breaks
          .filter(b => b.break_start && b.break_end)
          .map(b => ({
            break_start: parseTimeWithAMPM(b.break_start),
            break_end: parseTimeWithAMPM(b.break_end),
          })),
      }
      const res = await api.post('/shifts/', payload)
      onCreated(res.data)
    } catch (err) {
      const data = err.response?.data || {}
      const mapped = {}
      if (data.name)       mapped.name       = Array.isArray(data.name)       ? data.name[0]       : data.name
      if (data.start_time) mapped.start_time = Array.isArray(data.start_time) ? data.start_time[0] : data.start_time
      if (data.end_time)   mapped.end_time   = Array.isArray(data.end_time)   ? data.end_time[0]   : data.end_time
      if (data.detail)     mapped._global    = data.detail
      setErrors(mapped)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">
            THÊM MỚI CA LÀM VIỆC
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {errors._global && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{errors._global}</p>
          )}

          {/* Tên ca làm việc */}
          <Field label="Tên ca làm việc" required error={errors.name}>
            <input
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="VD: Ca sáng, Ca chiều..."
              className={inp(errors.name)}
            />
          </Field>

          {/* Giờ làm việc */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Giờ bắt đầu" required error={errors.start_time}>
              <input
                type="time"
                value={form.start_time}
                onChange={e => setField('start_time', e.target.value)}
                className={inp(errors.start_time)}
              />
            </Field>
            <Field label="Giờ kết thúc" required error={errors.end_time}>
              <input
                type="time"
                value={form.end_time}
                onChange={e => setField('end_time', e.target.value)}
                className={inp(errors.end_time)}
              />
            </Field>
          </div>

          {/* Tổng giờ làm việc */}
          <div className="bg-orange-50 border border-orange-200 rounded-[7px] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Tổng giờ làm việc:</span>
              <span className="text-lg font-bold text-orange-600">{totalHours}</span>
            </div>
          </div>

          {/* Nghỉ giữa ca */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Nghỉ giữa ca</span>
              <button
                type="button"
                onClick={addBreak}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                title="Thêm khoảng nghỉ"
              >
                <Plus size={14} />
              </button>
            </div>

            {breaks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">
                Nhấn (+) để thêm khoảng nghỉ
              </p>
            ) : (
              <div className="space-y-3">
                {breaks.map((brk, i) => (
                  <div key={i} className="flex items-end gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Field label="Giờ bắt đầu nghỉ" error={errors[`break_start_${i}`]}>
                        <input
                          type="time"
                          value={brk.break_start}
                          onChange={e => updateBreak(i, 'break_start', e.target.value)}
                          className={inp(errors[`break_start_${i}`])}
                        />
                      </Field>
                      <Field label="Giờ kết thúc nghỉ" error={errors[`break_end_${i}`]}>
                        <input
                          type="time"
                          value={brk.break_end}
                          onChange={e => updateBreak(i, 'break_end', e.target.value)}
                          className={inp(errors[`break_end_${i}`])}
                        />
                      </Field>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBreak(i)}
                      className="mb-0.5 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={reset}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Đặt lại"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 border border-gray-200 rounded-[7px] text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-[#E67E22] hover:bg-orange-600 text-white rounded-[7px] text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Lưu
          </button>
        </div>
      </div>
    </div>
  )
}
