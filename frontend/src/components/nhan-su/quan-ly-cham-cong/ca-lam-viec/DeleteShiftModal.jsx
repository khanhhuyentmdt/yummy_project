import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import api from '../../../../api/axios'

export default function DeleteShiftModal({ shift, ids, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const isBulk = !shift && ids && ids.length > 0
  const label  = isBulk
    ? `${ids.length} ca làm việc đã chọn`
    : `ca làm việc "${shift?.code}"`

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      if (isBulk) {
        await api.post('/shifts/bulk-delete/', { ids })
        onDeleted(ids)
      } else {
        await api.delete(`/shifts/${shift.id}/`)
        onDeleted([shift.id])
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể xóa. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onMouseDown={e => { if (!loading && e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
        {/* Warning icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-yellow-500">!</span>
          </div>
        </div>

        <p className="text-sm text-gray-700 italic mb-5">
          Bạn có chắc muốn xóa {label} không?
        </p>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            disabled={loading}
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#E67E22] hover:bg-orange-600 text-white text-sm font-semibold rounded-[7px] transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Vâng, xóa đi
          </button>
          <button
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#FFF0E6] hover:bg-orange-100 text-orange-600 text-sm font-semibold rounded-[7px] transition-colors disabled:opacity-60"
          >
            Không, quay lại
          </button>
        </div>
      </div>
    </div>
  )
}
