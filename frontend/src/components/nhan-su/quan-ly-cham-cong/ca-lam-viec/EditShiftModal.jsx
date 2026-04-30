import { useState, useEffect } from 'react'
import { X, RotateCcw, Loader2, Clock, Check } from 'lucide-react'
import api from '../../../../api/axios'
import { parseTimeWithAMPM, calculateWorkingHoursDisplay } from '../../../../utils/timeUtils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formFromData(data) {
  return {
    name:       data.name || '',
    start_time: data.start_time || '',
    end_time:   data.end_time || '',
    status:     data.status || 'active',
    breaks:     data.breaks || [],
  }
}

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function formatTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function groupHistoryByDate(history) {
  const groups = {}
  for (const entry of history) {
    const date = formatDate(entry.timestamp)
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
  }
  return Object.entries(groups)
}

function ActionText({ action, code }) {
  if (code && action.includes(code)) {
    const idx = action.lastIndexOf(code)
    return (
      <>
        {action.slice(0, idx)}
        <span className="text-orange-500 font-semibold">{code}</span>
        {action.slice(idx + code.length)}
      </>
    )
  }
  return <>{action}</>
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EditShiftModal({ shift, onClose, onSaved }) {
  const [form, setForm]               = useState(formFromData(shift))
  const [originalForm, setOriginalForm] = useState(formFromData(shift))
  const [shiftData, setShiftData]     = useState(shift)
  const [errors, setErrors]           = useState({})
  const [loading, setLoading]         = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [successVisible, setSuccessVisible] = useState(false)
  const [totalHours, setTotalHours] = useState('0 giờ')

  // Calculate total hours whenever form changes
  useEffect(() => {
    if (form.start_time && form.end_time) {
      const display = calculateWorkingHoursDisplay(form.start_time, form.end_time, form.breaks)
      setTotalHours(display)
    } else {
      setTotalHours('0 giờ')
    }
  }, [form.start_time, form.end_time, form.breaks])

  useEffect(() => {
    api.get(`shifts/${shift.id}/`)
      .then(res => {
        setShiftData(res.data)
        const f = formFromData(res.data)
        setForm(f)
        setOriginalForm(f)
      })
      .catch(() => {})
      .finally(() => setFetchLoading(false))
  }, [shift.id])

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }))
  }

  const handleReset = () => {
    setForm(originalForm)
    setErrors({})
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Parse AM/PM format to 24-hour format before sending to backend
      const payload = {
        ...form,
        start_time: parseTimeWithAMPM(form.start_time),
        end_time: parseTimeWithAMPM(form.end_time),
        breaks: form.breaks.map(b => ({
          break_start: parseTimeWithAMPM(b.break_start),
          break_end: parseTimeWithAMPM(b.break_end),
        })),
      }
      const res = await api.put(`shifts/${shift.id}/`, payload)
      setShiftData(res.data)
      const f = formFromData(res.data)
      setForm(f)
      setOriginalForm(f)
      setErrors({})
      setSuccessVisible(true)
      setTimeout(() => {
        setSuccessVisible(false)
        onSaved(res.data)
      }, 1500)
    } catch (err) {
      const data = err.response?.data || {}
      const mapped = {}
      Object.entries(data).forEach(([k, v]) => {
        mapped[k] = Array.isArray(v) ? v[0] : v
      })
      setErrors(mapped)
    } finally {
      setLoading(false)
    }
  }

  const addBreak = () => {
    setForm(f => ({
      ...f,
      breaks: [...f.breaks, { break_start: '', break_end: '' }]
    }))
  }

  const removeBreak = (idx) => {
    setForm(f => ({
      ...f,
      breaks: f.breaks.filter((_, i) => i !== idx)
    }))
  }

  const updateBreak = (idx, field, value) => {
    setForm(f => ({
      ...f,
      breaks: f.breaks.map((b, i) => i === idx ? { ...b, [field]: value } : b)
    }))
  }

  const inp = (err) =>
    `w-full px-3 py-2.5 border rounded-[7px] text-sm focus:outline-none focus:ring-2 bg-white transition-colors ${
      err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'
    }`

  const sel = (err) =>
    `w-full px-3 py-2.5 border rounded-[7px] text-sm focus:outline-none focus:ring-2 bg-white appearance-none transition-colors ${
      err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'
    }`

  if (fetchLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <Loader2 size={32} className="animate-spin text-orange-500 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">CHỈNH SỬA CA LÀM VIỆC</h2>
              <p className="text-sm text-gray-500">{shiftData.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Banner */}
        {successVisible && (
          <div className="bg-green-50 border-l-4 border-green-500 px-6 py-3 flex items-center gap-2">
            <Check size={18} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              Cập nhật ca làm việc thành công!
            </span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Tên ca làm việc */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên ca làm việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên ca làm việc"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                className={inp(errors.name)}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Giờ bắt đầu & Giờ kết thúc */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Giờ bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => setField('start_time', e.target.value)}
                  className={inp(errors.start_time)}
                />
                {errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Giờ kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={e => setField('end_time', e.target.value)}
                  className={inp(errors.end_time)}
                />
                {errors.end_time && <p className="mt-1 text-xs text-red-500">{errors.end_time}</p>}
              </div>
            </div>

            {/* Tổng giờ làm việc */}
            <div className="bg-orange-50 border border-orange-200 rounded-[7px] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tổng giờ làm việc:</span>
                <span className="text-lg font-bold text-orange-600">{totalHours}</span>
              </div>
            </div>

            {/* Giờ nghỉ giữa ca */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Giờ nghỉ giữa ca
                </label>
                <button
                  type="button"
                  onClick={addBreak}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  + Thêm giờ nghỉ
                </button>
              </div>
              {form.breaks.length > 0 && (
                <div className="space-y-2">
                  {form.breaks.map((brk, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={brk.break_start}
                        onChange={e => updateBreak(idx, 'break_start', e.target.value)}
                        className={inp()}
                        placeholder="Bắt đầu"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="time"
                        value={brk.break_end}
                        onChange={e => updateBreak(idx, 'break_end', e.target.value)}
                        className={inp()}
                        placeholder="Kết thúc"
                      />
                      <button
                        type="button"
                        onClick={() => removeBreak(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Trạng thái
              </label>
              <select
                value={form.status}
                onChange={e => setField('status', e.target.value)}
                className={sel(errors.status)}
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
              </select>
              {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
            </div>

            {/* Lịch sử */}
            {shiftData.history && shiftData.history.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">LỊCH SỬ CHỈNH SỬA</h3>
                <div className="space-y-4">
                  {groupHistoryByDate(shiftData.history).map(([date, entries]) => (
                    <div key={date}>
                      <div className="text-xs font-semibold text-gray-500 mb-2">{date}</div>
                      <div className="space-y-2">
                        {entries.map(entry => (
                          <div key={entry.id} className="flex items-start gap-3 text-sm">
                            <span className="text-gray-400 text-xs mt-0.5 w-12 flex-shrink-0">
                              {formatTime(entry.timestamp)}
                            </span>
                            <div className="flex-1">
                              <span className="text-gray-600">
                                <ActionText action={entry.action} code={shiftData.code} />
                              </span>
                              {entry.actor_name && (
                                <span className="text-gray-400 ml-2">— {entry.actor_name}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-[#FFF6F3]">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
            title="Đặt lại"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-[7px] text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-[7px] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: '#E67E22' }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Lưu
          </button>
        </div>
      </div>
    </div>
  )
}
