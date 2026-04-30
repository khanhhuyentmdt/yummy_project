import { useState, useEffect } from 'react'
import { ChevronLeft, RotateCcw, Loader2, Plus, Trash2, History } from 'lucide-react'
import api from '../../../../api/axios'
import SuccessModal from '../../../common/SuccessModal'

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

function toForm(shift) {
  return {
    name:       shift.name       || '',
    start_time: shift.start_time ? shift.start_time.slice(0, 5) : '',
    end_time:   shift.end_time   ? shift.end_time.slice(0, 5)   : '',
    status:     shift.status     || 'active',
  }
}

function toBreaks(shift) {
  return (shift.breaks || []).map(b => ({
    id:          b.id,
    break_start: b.break_start ? b.break_start.slice(0, 5) : '',
    break_end:   b.break_end   ? b.break_end.slice(0, 5)   : '',
  }))
}

function fmtTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

export default function EditShiftPage({ shiftId, onBack, onSaved }) {
  const [shiftData,  setShiftData]  = useState(null)
  const [form,       setForm]       = useState(null)
  const [origForm,   setOrigForm]   = useState(null)
  const [breaks,     setBreaks]     = useState([])
  const [origBreaks, setOrigBreaks] = useState([])
  const [errors,     setErrors]     = useState({})
  const [loading,    setLoading]    = useState(false)
  const [fetching,   setFetching]   = useState(true)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function load() {
      setFetching(true)
      try {
        const res = await api.get(`/shifts/${shiftId}/`)
        const s = res.data
        setShiftData(s)
        const f = toForm(s)
        const b = toBreaks(s)
        setForm(f)
        setOrigForm(f)
        setBreaks(b)
        setOrigBreaks(b)
      } catch (e) {
        console.error(e)
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [shiftId])

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
    setForm(origForm)
    setBreaks(origBreaks)
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
      const payload = {
        name:       form.name.trim(),
        start_time: form.start_time,
        end_time:   form.end_time,
        status:     form.status,
        breaks:     breaks.filter(b => b.break_start && b.break_end),
      }
      const res = await api.patch(`/shifts/${shiftId}/`, payload)
      const updated = res.data
      setShiftData(updated)
      const f = toForm(updated)
      const b = toBreaks(updated)
      setForm(f)
      setOrigForm(f)
      setBreaks(b)
      setOrigBreaks(b)
      setSuccessMsg(`Đã cập nhật ca làm việc "${updated.name}" thành công!`)
      if (onSaved) onSaved(updated)
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

  if (fetching) {
    return (
      <div className="p-6 bg-[#FFF6F3] min-h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </div>
    )
  }

  if (!shiftData || !form) {
    return (
      <div className="p-6 bg-[#FFF6F3] min-h-full">
        <p className="text-red-500">Không tìm thấy ca làm việc.</p>
      </div>
    )
  }

  const history = shiftData.history || []

  return (
    <div className="p-6 bg-[#FFF6F3] min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {shiftData.code} — {shiftData.name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý chấm công /{' '}
            <span
              className="text-orange-500 cursor-pointer hover:underline"
              onClick={onBack}
            >
              Ca làm việc
            </span>
            {' / '}
            <span className="text-gray-700">{shiftData.code}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-4">
        {/* Form card */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 pb-3 border-b border-gray-100">
            Thông tin ca làm việc
          </h3>

          {errors._global && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{errors._global}</p>
          )}

          {/* Tên */}
          <Field label="Tên ca làm việc" required error={errors.name}>
            <input
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              className={inp(errors.name)}
            />
          </Field>

          {/* Giờ */}
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

          {/* Trạng thái */}
          <Field label="Trạng thái">
            <div className="flex gap-4">
              {[['active', 'Đang hoạt động'], ['inactive', 'Ngưng hoạt động']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="edit-status"
                    value={val}
                    checked={form.status === val}
                    onChange={() => setField('status', val)}
                    className="accent-orange-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </Field>

          {/* Nghỉ giữa ca */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Nghỉ giữa ca</span>
              <button
                type="button"
                onClick={addBreak}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
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

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
              onClick={onBack}
              disabled={loading}
              className="px-5 py-2 border border-gray-200 rounded-[7px] text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-[#E67E22] hover:bg-orange-600 text-white rounded-[7px] text-sm font-medium disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Lưu
            </button>
          </div>
        </div>

        {/* History card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
            <History size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Lịch sử chỉnh sửa</h3>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Chưa có lịch sử</p>
          ) : (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {history.map(h => (
                <div key={h.id} className="flex gap-2.5">
                  <span className="mt-1 w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-700 leading-relaxed">{h.action}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {h.actor_name && <span className="font-medium text-gray-500">{h.actor_name} · </span>}
                      {fmtTimestamp(h.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <SuccessModal message={successMsg} onClose={() => setSuccessMsg('')} />
      )}
    </div>
  )
}
