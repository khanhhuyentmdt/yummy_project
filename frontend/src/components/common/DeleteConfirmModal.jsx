import { useState } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * DeleteConfirmModal — modal xác nhận xóa với thiết kế đồng bộ
 * 
 * Props:
 *   title       {string}   — tiêu đề (vd: "sản phẩm", "nhân viên")
 *   itemName    {string}   — tên item cụ thể (vd: "MSP001") - dùng cho xóa đơn
 *   count       {number}   — số lượng items - dùng cho xóa nhiều
 *   onConfirm   {function} — async function được gọi khi xác nhận
 *   onClose     {function} — function được gọi khi đóng modal
 */
export default function DeleteConfirmModal({ title, itemName, count, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const isBulk = Boolean(count && count > 0)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(isBulk
        ? `Không thể xóa các ${title} đã chọn. Vui lòng thử lại.`
        : `Không thể xóa ${title}. Vui lòng thử lại.`
      )
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 px-8 py-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center mb-7">
          <span className="text-yellow-400 font-extrabold" style={{ fontSize: '2.25rem', lineHeight: 1 }}>!</span>
        </div>

        {isBulk ? (
          <>
            <p className="text-base font-semibold text-gray-800 italic text-center leading-relaxed">
              Bạn có chắc muốn xóa
            </p>
            <p className="text-base font-semibold text-gray-800 italic text-center mb-8 leading-relaxed">
              <span className="not-italic font-bold">{count}</span> {title} đã chọn không?
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-semibold text-gray-800 italic text-center leading-relaxed">
              Bạn có chắc muốn xóa {title}
            </p>
            <p className="text-base font-semibold text-gray-800 italic text-center mb-8 leading-relaxed">
              "{itemName}" không?
            </p>
          </>
        )}

        {error && <p className="text-xs text-red-500 mb-4 text-center">{error}</p>}

        <div className="flex gap-3 w-full">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-[7px] hover:opacity-90 active:opacity-80 disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: '#E67E22' }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Vâng, xóa đi
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 text-sm font-bold text-orange-500 rounded-[7px] hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#FFF0E6' }}
          >
            Không, quay lại
          </button>
        </div>
      </div>
    </div>
  )
}
