import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import api from "../../../../../../api/axios";

export default function ProductGroupFormView({
  mode,
  groupId,
  onCancel,
  onSaved,
}) {
  const isEdit = mode === "edit";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [history, setHistory] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const pendingSavedRef = useRef(null);

  useEffect(() => {
    if (!isEdit || !groupId) return;
    api
      .get(`product-groups/${groupId}/`)
      .then((res) => {
        const g = res.data;
        setName(g.name || "");
        setDescription(g.description || "");
        setStatus(g.status || "active");
        setHistory(g);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [isEdit, groupId]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Tên nhóm sản phẩm là bắt buộc";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await api.put(`product-groups/${groupId}/`, {
          name: name.trim(),
          description: description.trim(),
          status,
        });
      } else {
        res = await api.post("product-groups/", {
          name: name.trim(),
          description: description.trim(),
        });
      }
      pendingSavedRef.current = res.data;
      setShowSuccess(true);
    } catch (err) {
      const data = err.response?.data || {};
      setErrors({
        name: data.name?.[0] || data.non_field_errors?.[0] || "",
        description: data.description?.[0] || "",
        _general: data.detail || "",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestSave = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (
      window.confirm(
        isEdit
          ? "Bạn có chắc muốn cập nhật nhóm sản phẩm này không?"
          : "Bạn có chắc muốn lưu nhóm sản phẩm này không?",
      )
    ) {
      handleSave();
    }
  };

  const handleReset = () => {
    if (isEdit && history) {
      setName(history.name || "");
      setDescription(history.description || "");
      setStatus(history.status || "active");
    } else {
      setName("");
      setDescription("");
    }
    setErrors({});
  };

  if (loadingData)
    return isEdit ? (
      <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-orange-400" />
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-orange-400" />
      </div>
    );

  return (
    <div
      className={
        isEdit
          ? "w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
          : "max-w-2xl mx-auto"
      }
    >
      {isEdit ? (
        <>
          <div className="relative px-6 py-4 border-b border-gray-200">
            <h1 className="text-[18px] font-bold text-gray-900 uppercase pr-10">
              {`Chỉnh sửa nhóm sản phẩm ${history?.code || ""}`}
            </h1>
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#C7CCDA] hover:text-gray-500 transition-colors"
            >
              <X size={22} />
            </button>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tên nhóm sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="Nhập tên nhóm sản phẩm"
                    className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none"
                    >
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Tạm ngưng</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả"
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>

              {history && (
                <div className="border border-gray-200 rounded-md p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Lịch sử
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(history.created_at).toLocaleDateString("vi-VN")}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    <span>
                      {new Date(history.created_at).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                    <span>Thêm mới nhóm sản phẩm</span>
                    <span className="text-orange-500 font-semibold">
                      {history.code}
                    </span>
                  </div>
                </div>
              )}

              {errors._general && (
                <p className="text-sm text-red-500">{errors._general}</p>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 mt-7">
              <button
                onClick={handleReset}
                title="Đặt lại"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="h-10 min-w-[100px] px-6 rounded-xl border border-gray-300 bg-white text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={requestSave}
                disabled={loading}
                className="h-10 min-w-[96px] px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors disabled:opacity-60"
              >
                {loading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 tracking-wide uppercase">
              Thêm mới nhóm sản phẩm
            </h1>
            <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
              <span>Bếp trung tâm</span>
              <ChevronRight size={13} />
              <span>Quản lý danh mục</span>
              <ChevronRight size={13} />
              <span>Thông tin sản phẩm</span>
              <ChevronRight size={13} />
              <span className="text-orange-500 font-medium">
                Thêm mới nhóm sản phẩm
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="grid gap-4 grid-cols-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tên nhóm sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Nhập tên nhóm sản phẩm"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả"
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y"
              />
            </div>

            {errors._general && (
              <p className="text-sm text-red-500">{errors._general}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handleReset}
              title="Đặt lại"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="h-10 min-w-[100px] px-6 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={requestSave}
              disabled={loading}
              className="h-10 min-w-[100px] px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </>
      )}

      {/* Cancel confirm */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[370px] max-w-[calc(100vw-2rem)] mx-4 px-5 pt-5 pb-5 text-center">
            <div className="w-[68px] h-[68px] mx-auto rounded-full border-[3px] border-yellow-400 flex items-center justify-center mb-4">
              <AlertTriangle size={42} className="text-yellow-400" />
            </div>
            <h3 className="text-[20px] leading-tight font-semibold italic text-gray-900 mb-6">
              Bạn có chắc muốn hủy biểu mẫu này?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onCancel}
                className="h-10 rounded-lg bg-[#F58232] hover:bg-[#E6772B] text-white text-[14px] font-bold transition-colors"
              >
                Vâng, hủy đi
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="h-10 rounded-lg bg-[#FDF0E6] hover:bg-[#FBE5D4] text-[#F58232] text-[14px] font-semibold transition-colors"
              >
                Không, quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-80 mx-4 px-8 py-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <p className="text-xl font-semibold italic text-gray-900 mb-6 text-center">
              {isEdit
                ? "Chỉnh sửa nhóm sản phẩm thành công!"
                : "Thêm nhóm sản phẩm thành công!"}
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                if (pendingSavedRef.current) {
                  onSaved?.(pendingSavedRef.current);
                  pendingSavedRef.current = null;
                } else {
                  onCancel?.();
                }
              }}
              className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-base font-bold transition-colors"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
