import { useState } from 'react'
import api from '../../../../api/axios'

export default function DeleteBonusModal({ bonus, ids, onDeleted, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const isBulk = !bonus && ids && ids.length > 0

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      if (isBulk) {
        await api.post('/bonuses/bulk-delete/', { ids })
        onDeleted(ids)
      } else {
        await api.delete(`/bonuses/${bonus.id}/`)
        onDeleted([bonus.id])
      }
    } catch {
      setError('Xoa that bai. Vui long thu lai.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => { if (!loading) onClose() }}
    >
      <div
        className="bg-white rounded-[14px] shadow-xl w-[420px] p-8 flex flex-col items-center gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Warning icon */}
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
          <span className="text-yellow-500 text-3xl font-bold">!</span>
        </div>

        <p className="text-center text-gray-700 italic text-[15px]">
          {isBulk
            ? <>Ban co chac muon xoa <strong>{ids.length}</strong> thuong da chon khong?</>
            : <>Ban co chac muon xoa thuong <strong className="text-orange-500">"{bonus?.code}"</strong> khong?</>
          }
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-[7px] text-white font-semibold text-sm"
            style={{ backgroundColor: '#E67E22' }}
          >
            {loading ? 'Dang xoa...' : 'Vang, xoa di'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-[7px] font-semibold text-sm border border-orange-200 text-orange-600"
            style={{ backgroundColor: '#FFF0E6' }}
          >
            Khong, quay lai
          </button>
        </div>
      </div>
    </div>
  )
}
