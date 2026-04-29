import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import api from '../../../api/axios'

export default function DeleteShippingUnitModal({ shippingUnit, ids, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isBulk = Array.isArray(ids) && ids.length > 0
  const displayName = isBulk
    ? `${ids.length} đối tác vận chuyển`
    : `"${shippingUnit?.code || ''}"`

  const handleDelete = async () => {
    setLoading(true)
    setError('')
    try {
      if (isBulk) {
        await api.post('shipping-units/bulk-delete/', { ids })
        onDeleted(ids)
      } else {
        await api.delete(`shipping-units/${shippingUnit.id}/`)
        onDeleted([shippingUnit.id])
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Có lỗi xảy ra khi xóa.'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Icon cảnh báo */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <AlertTriangle size={32} className="text-yellow-500" />
          </div>
        </div>

        {/* Message */}
        <p className="text-center text-gray-700 mb-6 italic">
          Bạn có chắc muốn xóa đối tác vận chuyển {displayName} không?
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-[7px] transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#E67E22' }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Đang xóa...' : 'Vâng, xóa đi'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-[7px] transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#FFF0E6', color: '#E67E22' }}
          >
            Không, quay lại
          </button>
        </div>
      </div>
    </div>
  )
}
