import { Check } from 'lucide-react'

/**
 * SuccessModal — pop-up thông báo thao tác thành công.
 *
 * Props:
 *   message  {string}   — nội dung hiển thị (italic, center)
 *   onClose  {function} — gọi khi bấm "Xong" hoặc click ra ngoài
 */
export default function SuccessModal({ message, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-80 mx-4 px-8 py-10 flex flex-col items-center">

        {/* Green circle + checkmark */}
        <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center mb-6">
          <Check size={38} strokeWidth={3} className="text-green-500" />
        </div>

        {/* Message */}
        <p className="text-base font-semibold text-gray-800 italic text-center mb-8 leading-relaxed">
          {message}
        </p>

        {/* Xong button */}
        <button
          onClick={onClose}
          className="px-10 py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 active:opacity-80 transition-opacity"
          style={{ backgroundColor: '#E67E22' }}
        >
          Xong
        </button>
      </div>
    </div>
  )
}
