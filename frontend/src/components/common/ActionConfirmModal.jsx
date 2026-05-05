import { Loader2 } from "lucide-react";

export default function ActionConfirmModal({
  title = "Xác nhận",
  message,
  note = "",
  confirmLabel = "Tiếp tục",
  cancelLabel = "Không, quay lại",
  onConfirm,
  onClose,
  loading = false,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose?.();
      }}
    >
      <div className="w-full max-w-[390px] rounded-2xl bg-white shadow-2xl px-5 pt-5 pb-5 text-center">
        <div className="w-[68px] h-[68px] mx-auto rounded-full border-[3px] border-yellow-400 flex items-center justify-center mb-4">
          <span
            className="text-yellow-400 font-extrabold"
            style={{ fontSize: "2rem", lineHeight: 1 }}
          >
            !
          </span>
        </div>

        <h3 className="text-[20px] leading-tight font-semibold italic text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-700 leading-6">{message}</p>
        {note && <p className="mt-2 text-xs text-gray-500 leading-5">{note}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-10 rounded-lg bg-[#F58232] hover:bg-[#E6772B] disabled:opacity-60 text-white text-[14px] font-bold leading-none transition-colors flex items-center justify-center gap-1.5"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-lg bg-[#FDF0E6] hover:bg-[#FBE5D4] disabled:opacity-60 text-[#F58232] text-[14px] font-semibold leading-none transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
