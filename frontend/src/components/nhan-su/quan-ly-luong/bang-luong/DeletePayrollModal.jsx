import { useState } from 'react'
import api from '../../../../api/axios'

export default function DeletePayrollModal({ payroll, ids, onDeleted, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isBulk = Boolean(ids && ids.length)

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      if (isBulk) {
        await api.post('/payrolls/bulk-delete/', { ids })
        onDeleted(ids)
      } else {
        await api.delete(`/payrolls/${payroll.id}/`)
        onDeleted([payroll.id])
      }
    } catch {
      setError('Xóa thất bại. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  const message = isBulk
    ? `Bạn có chắc muốn xóa ${ids.length} bảng lương đã chọn không?`
    : `Bạn có chắc muốn xóa bảng lương "${payroll?.code}" không?`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={e => { if (!loading && e.target === e.currentTarget) onCancel() }}
      style={{ fontFamily: 'Nunito Sans, sans-serif' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 px-8 py-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center mb-7">
          <span className="text-yellow-400 font-extrabold" style={{ fontSize: '2.25rem', lineHeight: 1 }}>!</span>
        </div>
        <p className="text-base font-semibold text-gray-800 italic text-center mb-4 leading-relaxed">
          {message}
        </p>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <div className="flex gap-3 w-full">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 text-sm font-bold text-white rounded-[7px] hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#E67E22' }}
          >
            {loading ? 'Đang xóa...' : 'Vâng, xóa đi'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 text-sm font-bold text-orange-500 rounded-[7px] hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#FFF0E6' }}
          >
            Không, quay lại
          </button>
        </div>
      </div>
    </div>
  )
}
