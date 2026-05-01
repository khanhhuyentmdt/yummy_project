import { useState } from 'react'
import api from '../../../../api/axios'

export default function DeleteWorkScheduleModal({ schedule, ids, onDeleted, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const isBulk  = !schedule && ids && ids.length > 0
  const label   = isBulk
    ? `${ids.length} lịch làm việc đã chọn`
    : `lịch làm việc "${schedule?.code}"`

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      if (isBulk) {
        await api.post('/schedules/bulk-delete/', { ids })
        onDeleted(ids)
      } else {
        await api.delete(`/schedules/${schedule.id}/`)
        onDeleted([schedule.id])
      }
    } catch {
      setError('Xóa thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={() => !loading && onClose()}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-3xl font-bold text-yellow-500">!</span>
          </div>
        </div>
        <p className="text-gray-700 italic mb-2">
          Bạn có chắc muốn xóa <strong>{label}</strong> không?
        </p>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose} disabled={loading}
            className="flex-1 py-2 rounded-[7px] font-semibold text-[#E67E22] bg-[#FFF0E6] hover:bg-orange-100">
            Không, quay lại
          </button>
          <button
            onClick={handleDelete} disabled={loading}
            className="flex-1 py-2 rounded-[7px] font-semibold text-white bg-[#E67E22] hover:bg-orange-600">
            {loading ? 'Đang xóa...' : 'Vâng, xóa đi'}
          </button>
        </div>
      </div>
    </div>
  )
}
