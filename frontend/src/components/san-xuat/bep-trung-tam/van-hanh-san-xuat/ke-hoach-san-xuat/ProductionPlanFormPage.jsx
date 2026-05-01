import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronRight,
  FileSpreadsheet,
  Package,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../../../../api/axios";
import SuccessModal from "../../../../common/SuccessModal";

const IMPORT_ACCEPT = ".xlsx,.xls,.csv,.json";

const emptyForm = {
  name: "",
  start_date: "",
  end_date: "",
  notes: "",
};

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const formatDuration = (minutes) => {
  const total = Number(minutes) || 0;
  if (!total) return "0 phút";
  const hours = Math.floor(total / 60);
  const remain = total % 60;
  if (!hours) return `${remain} phút`;
  if (!remain) return `${hours} giờ`;
  return `${hours} giờ ${remain} phút`;
};

const diffDays = (startDate, endDate) => {
  if (!startDate || !endDate) return "--";
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "--";
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? `${diff} ngày` : "--";
};

export default function ProductionPlanFormPage({
  mode = "create",
  productionPlanId,
  onCancel,
  onSaved,
}) {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [semiFinishedProducts, setSemiFinishedProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [importError, setImportError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const pendingSavedRef = useRef(null);

  useEffect(() => {
    api
      .get("semi-finished-products/")
      .then((res) =>
        setSemiFinishedProducts(res.data.semi_finished_products || []),
      )
      .catch(() => setSemiFinishedProducts([]));
  }, []);

  useEffect(() => {
    if (mode !== "edit") return;
    setLoading(true);
    api
      .get(`production-plans/${productionPlanId}/`)
      .then((res) => {
        const plan = res.data || {};
        setForm({
          name: plan.name || "",
          start_date: plan.start_date || "",
          end_date: plan.end_date || "",
          notes: plan.notes || "",
        });
        setItems(
          (plan.items || []).map((item) => ({
            id: item.id || `${item.semi_finished_product_id}-${Date.now()}-${Math.random()}`,
            semi_finished_product_id: item.semi_finished_product_id,
            code: item.code || "",
            name: item.name || "",
            unit: item.unit || "",
            quantity: item.quantity,
            duration_minutes: item.duration_minutes,
          })),
        );
      })
      .catch(() => setErrors({ submit: "Không tìm thấy kế hoạch sản xuất." }))
      .finally(() => setLoading(false));
  }, [mode, productionPlanId]);

  const filteredProducts = useMemo(() => {
    const keyword = normalizeText(search);
    if (!keyword) return [];
    return semiFinishedProducts
      .filter((item) => {
        const matched =
          normalizeText(item.name).includes(keyword) ||
          normalizeText(item.code).includes(keyword);
        const alreadyAdded = items.some(
          (selected) =>
            String(selected.semi_finished_product_id) === String(item.id),
        );
        return matched && !alreadyAdded;
      })
      .slice(0, 6);
  }, [items, search, semiFinishedProducts]);

  const totals = useMemo(() => {
    const totalProducts = items.length;
    const totalQuantity = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0,
    );
    const totalDuration = items.reduce(
      (sum, item) => sum + (Number(item.duration_minutes) || 0),
      0,
    );
    return {
      totalProducts,
      totalQuantity,
      totalDuration,
      timeRange: diffDays(form.start_date, form.end_date),
    };
  }, [form.end_date, form.start_date, items]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addProduct = (product) => {
    setItems((prev) => [
      ...prev,
      {
        id: `${product.id}-${Date.now()}`,
        semi_finished_product_id: product.id,
        code: product.code || "",
        name: product.name || "",
        unit: product.unit || "",
        quantity: 1,
        duration_minutes: 60,
      },
    ]);
    setSearch("");
    if (errors.items) setErrors((prev) => ({ ...prev, items: undefined }));
  };

  const updateItem = (itemId, key, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [key]: value } : item,
      ),
    );
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const parseImportedRows = async (file) => {
    const ext = file.name.toLowerCase().split(".").pop();
    let rows = [];

    if (ext === "json") {
      const text = await file.text();
      const parsed = JSON.parse(text);
      rows = Array.isArray(parsed) ? parsed : parsed.items || [];
    } else {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    }

    return rows.map((row) => {
      const code = row["Mã BTP"] || row.code || row.ma_btp || "";
      const name =
        row["Tên bán thành phẩm"] || row.name || row.ten_ban_thanh_pham || "";
      const quantity = Number(row["Số lượng"] || row.quantity || 1) || 1;
      const duration =
        Number(
          row["Thời lượng"] || row.duration_minutes || row.thoi_luong || 60,
        ) || 60;

      const matched = semiFinishedProducts.find(
        (item) =>
          normalizeText(item.code) === normalizeText(code) ||
          normalizeText(item.name) === normalizeText(name),
      );

      if (!matched) return null;

      return {
        id: `${matched.id}-${Date.now()}-${Math.random()}`,
        semi_finished_product_id: matched.id,
        code: matched.code || "",
        name: matched.name || "",
        unit: matched.unit || "",
        quantity,
        duration_minutes: duration,
      };
    });
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setImportError("");
      const parsedItems = (await parseImportedRows(file)).filter(Boolean);
      if (!parsedItems.length) {
        setImportError("Không tìm thấy bán thành phẩm hợp lệ trong file.");
        return;
      }
      setItems((prev) => {
        const existingIds = new Set(
          prev.map((item) => String(item.semi_finished_product_id)),
        );
        const next = [...prev];
        parsedItems.forEach((item) => {
          if (!existingIds.has(String(item.semi_finished_product_id))) {
            next.push(item);
          }
        });
        return next;
      });
      if (errors.items) setErrors((prev) => ({ ...prev, items: undefined }));
    } catch {
      setImportError("Không thể đọc file danh sách. Vui lòng kiểm tra lại.");
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Tên kế hoạch là bắt buộc";
    if (!form.start_date) nextErrors.start_date = "Ngày bắt đầu là bắt buộc";
    if (!form.end_date) nextErrors.end_date = "Ngày kết thúc là bắt buộc";
    if (
      form.start_date &&
      form.end_date &&
      new Date(form.end_date) < new Date(form.start_date)
    ) {
      nextErrors.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    if (items.length === 0) nextErrors.items = "Bán thành phẩm là bắt buộc";
    return nextErrors;
  };

  const savePlan = (status) => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0 && status !== "draft") {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));
    const fallbackDraftName = `Kế hoạch nháp ${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")}`;
    const payload = {
      name: form.name.trim() || fallbackDraftName,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      notes: form.notes,
      status,
      items: items.map((item) => ({
        semi_finished_product_id: item.semi_finished_product_id,
        quantity: Number(item.quantity) || 0,
        duration_minutes: Number(item.duration_minutes) || 0,
      })),
    };

    const request =
      mode === "edit"
        ? api.put(`production-plans/${productionPlanId}/`, payload)
        : api.post("production-plans/", payload);

    request
      .then((res) => {
        pendingSavedRef.current = res.data;
        setShowSuccess(true);
      })
      .catch((error) => {
        const responseData = error.response?.data || {};
        const submitMessage =
          responseData.detail ||
          responseData.name?.[0] ||
          responseData.start_date?.[0] ||
          responseData.end_date?.[0] ||
          "Không thể lưu kế hoạch sản xuất.";
        setErrors((prev) => ({ ...prev, submit: submitMessage }));
      })
      .finally(() => setSaving(false));
  };

  const requestCancel = () => {
    if (saving) return;
    if (
      window.confirm("Bạn có chắc muốn hủy biểu mẫu kế hoạch sản xuất này không?")
    ) {
      onCancel?.();
    }
  };

  const requestSave = (status) => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0 && status !== "draft") {
      setErrors(nextErrors);
      return;
    }
    const message =
      status === "draft"
        ? "Bạn có chắc muốn lưu nháp kế hoạch sản xuất này không?"
        : mode === "edit"
          ? "Bạn có chắc muốn cập nhật kế hoạch sản xuất này không?"
          : "Bạn có chắc muốn lưu kế hoạch sản xuất này không?";
    if (window.confirm(message)) {
      savePlan(status);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        Đang tải dữ liệu kế hoạch sản xuất...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={requestCancel}
          className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
        >
          &lt; Quay lại danh sách kế hoạch sản xuất
        </button>
        <h1 className="mt-2 text-2xl font-bold text-gray-800 tracking-wide">
          {mode === "edit"
            ? "CHỈNH SỬA KẾ HOẠCH SẢN XUẤT"
            : "THÊM MỚI KẾ HOẠCH SẢN XUẤT"}
        </h1>
      </div>

      {errors.submit && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_0.95fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5">
              Thông tin chung
            </h2>
            <div className="border-t border-gray-100 mb-5" />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên kế hoạch <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Nhập tên kế hoạch sản xuất"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setField("start_date", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <Calendar
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.start_date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.start_date}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setField("end_date", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <Calendar
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.end_date && (
                  <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Bán thành phẩm cần sản xuất{" "}
              <span className="text-red-500">*</span>
            </h2>

            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm bán thành phẩm"
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {errors.items && (
              <p className="mb-3 text-xs text-red-500">{errors.items}</p>
            )}

            {filteredProducts.length > 0 && (
              <div className="mb-4 rounded-xl border border-gray-200 overflow-hidden">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">{product.code}</p>
                    </div>
                    <span className="text-sm font-semibold text-orange-500">
                      Thêm
                    </span>
                  </button>
                ))}
              </div>
            )}

            {items.length === 0 ? (
              <div className="border border-gray-100 bg-gray-50/40 rounded-xl py-12 px-6 text-center">
                <Package size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-400 mb-4">
                  Bạn chưa thêm bán thành phẩm nào
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-4 rounded-lg bg-[#E56A00] hover:bg-[#D45F00] text-white text-sm font-semibold transition-colors"
                >
                  Nhập file danh sách
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMPORT_ACCEPT}
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-500 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <FileSpreadsheet size={14} />
                    Nhập file danh sách
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={IMPORT_ACCEPT}
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                          Bán thành phẩm
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                          ĐVT
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                          Số lượng
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                          Thời lượng
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                          Xóa
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-400">{item.code}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {item.unit}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(item.id, "quantity", e.target.value)
                              }
                              className="w-24 ml-auto block px-3 py-2 text-sm text-right border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.duration_minutes}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "duration_minutes",
                                  e.target.value,
                                )
                              }
                              className="w-28 ml-auto block px-3 py-2 text-sm text-right border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importError && (
              <p className="mt-3 text-xs text-red-500">{importError}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5">
              Tổng hợp
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Tổng sản phẩm</span>
                <span className="font-medium text-gray-800">
                  {totals.totalProducts}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Tổng số lượng</span>
                <span className="font-medium text-gray-800">
                  {totals.totalQuantity}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Thời lượng sản xuất</span>
                <span className="font-medium text-gray-800">
                  {formatDuration(totals.totalDuration)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Thời gian sản xuất</span>
                <span className="font-medium text-gray-800">
                  {totals.timeRange}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Ghi chú
            </h2>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Nhập ghi chú..."
              rows={5}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => {
            setForm(emptyForm);
            setItems([]);
            setErrors({});
            setImportError("");
          }}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          title="Làm mới biểu mẫu"
        >
          <RefreshCcw size={18} />
        </button>
        <button
          type="button"
          onClick={requestCancel}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => requestSave("draft")}
          disabled={saving}
          className="px-5 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
        >
          Lưu nháp
        </button>
        <button
          type="button"
          onClick={() => requestSave(mode === "edit" ? "pending" : "sent")}
          disabled={saving}
          className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-60"
        >
          {mode === "edit" ? "Cập nhật" : "Thêm"}
        </button>
      </div>

      {showSuccess && (
        <SuccessModal
          message={
            mode === "edit"
              ? "Cập nhật kế hoạch sản xuất thành công!"
              : "Thêm kế hoạch sản xuất thành công!"
          }
          onClose={() => {
            setShowSuccess(false);
            onSaved?.(pendingSavedRef.current);
          }}
        />
      )}
    </div>
  );
}
