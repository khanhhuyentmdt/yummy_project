import { useState } from 'react'
import { ChevronLeft, RotateCcw, CheckCircle } from 'lucide-react'
import api from '../../../../api/axios'

const TODAY = new Date().toISOString().slice(0, 10)

const INIT_FORM = {
  reason:         '',
  bonus_date:     TODAY,
  total_amount:   '0',
  recipient_type: 'all',
  employee_count: '0',
  bonus_type:     'direct',
  notes:          '',
}

function inputCls(err) {
  return `w-full border rounded-[7px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 font-[Nunito_Sans] ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
  }`
}

export default function AddBonusPage({ onBack, onCreated }) {
  const [form,    setForm]    = useState(INIT_FORM)
  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)
  const [created, setCreated] = useState(null)   // holds newly created bonus for SuccessModal

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function handleReset() {
    setForm(INIT_FORM)
    setErrors({})
  }

  function validate() {
    const e = {}
    if (!form.reason.trim())    e.reason     = 'Vui long nhap ly do thuong'
    if (!form.bonus_date)       e.bonus_date = 'Vui long chon ngay thuong'
    if (Number(form.total_amount) < 0) e.total_amount = 'Muc thuong khong hop le'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    try {
      const payload = {
        reason:         form.reason.trim(),
        bonus_date:     form.bonus_date,
        total_amount:   Number(form.total_amount),
        recipient_type: form.recipient_type,
        employee_count: Number(form.employee_count),
        bonus_type:     form.bonus_type,
        notes:          form.notes,
      }
      const res = await api.post('/bonuses/', payload)
      setCreated(res.data)
    } catch (err) {
      const data = err.response?.data || {}
      const fieldErrors = {}
      Object.keys(data).forEach(k => {
        fieldErrors[k] = Array.isArray(data[k]) ? data[k][0] : data[k]
      })
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { reason: 'Co loi xay ra, vui long thu lai.' })
    } finally {
      setSaving(false)
    }
  }

  // SuccessModal: created != null
  function handleSuccessOk() {
    const bonus = created
    setCreated(null)
    onCreated && onCreated(bonus)   // caller navigates to list and opens edit modal
  }

  return (
    <div className="min-h-screen font-[Nunito_Sans]" style={{ backgroundColor: '#FFF6F3' }}>
      {/* SuccessModal */}
      {created && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-80 p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={36} />
            </div>
            <p className="text-center font-semibold text-gray-800">
              Them thuong thanh cong!
            </p>
            <p className="text-center text-sm text-gray-500">
              Ma: <span className="text-orange-500 font-bold">{created.code}</span>
            </p>
            <button
              onClick={handleSuccessOk}
              className="w-full py-2.5 rounded-[7px] text-white font-semibold text-sm"
              style={{ backgroundColor: '#E67E22' }}
            >
              OK — Chinh sua ngay
            </button>
          </div>
        </div>
      )}

      {/* Back + Title */}
      <div className="px-8 pt-6 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-3"
        >
          <ChevronLeft size={16} />
          Quay lai danh sach thuong
        </button>
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">THEM MOI THUONG</h1>
      </div>

      {/* 2-column layout */}
      <div className="px-8 pb-8 grid grid-cols-[1fr_320px] gap-6">

        {/* LEFT — Thong tin chung */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-gray-700">Thong tin chung</h2>

          {/* Ly do thuong */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ly do thuong <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.reason}
              onChange={e => setField('reason', e.target.value)}
              placeholder="Nhap ly do thuong"
              className={inputCls(errors.reason)}
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          {/* Ngay thuong + Muc thuong */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ngay thuong <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.bonus_date}
                onChange={e => setField('bonus_date', e.target.value)}
                className={inputCls(errors.bonus_date)}
              />
              {errors.bonus_date && <p className="text-red-500 text-xs mt-1">{errors.bonus_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Muc thuong tong <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.total_amount}
                  onChange={e => setField('total_amount', e.target.value)}
                  className={`${inputCls(errors.total_amount)} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">d</span>
              </div>
              {errors.total_amount && <p className="text-red-500 text-xs mt-1">{errors.total_amount}</p>}
            </div>
          </div>

          {/* Nhan vien duoc thuong */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nhan vien duoc thuong <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-8">
              {[
                { value: 'all',    label: 'Tat ca nhan vien' },
                { value: 'custom', label: 'Tuy chon'         },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.recipient_type === opt.value}
                    onChange={() => setField('recipient_type', opt.value)}
                    className="w-4 h-4 rounded border-gray-300 checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {/* If custom: show count input */}
            {form.recipient_type === 'custom' && (
              <div className="mt-3">
                <label className="block text-xs text-gray-500 mb-1">So luong nhan vien</label>
                <input
                  type="number"
                  min="0"
                  value={form.employee_count}
                  onChange={e => setField('employee_count', e.target.value)}
                  className={inputCls('')}
                  style={{ maxWidth: 160 }}
                />
              </div>
            )}
          </div>

          {/* Hinh thuc thuong */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hinh thuc thuong <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-8">
              {[
                { value: 'direct',          label: 'Thuong truc tiep'      },
                { value: 'salary_addition', label: 'Thuong cong vao luong' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.bonus_type === opt.value}
                    onChange={() => setField('bonus_type', opt.value)}
                    className="w-4 h-4 rounded border-gray-300 checked:bg-[#E67E22] checked:border-[#E67E22] focus:ring-2 focus:ring-orange-300 focus:ring-offset-0"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Ghi chu */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-700 mb-3">Ghi chu</h2>
          <textarea
            rows={8}
            value={form.notes}
            onChange={e => setField('notes', e.target.value)}
            placeholder="Nhap ghi chu..."
            className="w-full border border-gray-300 rounded-[7px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none font-[Nunito_Sans]"
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-end gap-3 px-8 py-4 border-t border-orange-100 shadow-lg"
        style={{ backgroundColor: '#FFF6F3' }}
      >
        <button
          onClick={handleReset}
          className="p-2 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50"
          title="Reset form"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-[7px] border border-gray-300 text-gray-600 text-sm font-semibold bg-white hover:bg-gray-50"
        >
          Huy bo
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-8 py-2 rounded-[7px] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#E67E22' }}
        >
          {saving ? 'Dang luu...' : 'Them'}
        </button>
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-20" />
    </div>
  )
}
