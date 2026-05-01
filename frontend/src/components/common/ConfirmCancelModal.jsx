/**
 * ConfirmCancelModal — pop-up xác nhận khi người dùng hủy biểu mẫu.
 *
 * Props:
 *   message  {string}   — nội dung hiển thị (mặc định: 'Bạn có chắc muốn hủy biểu mẫu này không?')
 *   onConfirm {function} — gọi khi bấm "Vâng, hủy đi"
 *   onCancel  {function} — gọi khi bấm "Không, quay lại" hoặc click backdrop
 */
export default function ConfirmCancelModal({
  message = 'Bạn có chắc muốn hủy biểu mẫu này không?',
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}
      style={{ fontFamily: 'Nunito Sans, sans-serif' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 px-8 py-10 flex flex-col items-center">
        {/* Yellow warning circle */}
        <div className="w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center mb-7">
          <span className="text-yellow-400 font-extrabold" style={{ fontSize: '2.25rem', lineHeight: 1 }}>!</span>
        </div>

        <p className="text-base font-semibold text-gray-800 italic text-center mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-sm font-bold text-white rounded-[7px] hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ backgroundColor: '#E67E22' }}
          >
            Vâng, hủy đi
          </button>
          <button
            onClick={onCancel}
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
