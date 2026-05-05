import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import api from "../../../../api/axios";
import ActionConfirmModal from "../../../common/ActionConfirmModal";
import SuccessModal from "../../../common/SuccessModal";

const EMPTY_FORM = {
  purchase_order:  "",
  supplier:        "",
  responsible_name: "",
  receipt_date:    "",
  notes:           "",
  discount_type:   "percent",
  discount_value:  "0",
  shipping_fee:    "0",
  vat_percent:     "0",
  other_fee:       "0",
  other_fee_label: "",
};

const EMPTY_ITEM = {
  material_id:       "",
  material_code:     "",
  material_name:     "",
  material_image:    "",
  quantity_ordered:  "0",
  quantity_received: "1",
  unit:              "",
  unit_price:        "0",
  notes:             "",
};

const DISCOUNT_OPTIONS = [
  { value: "percent", label: "Giảm theo phần trăm", suffix: "%" },
  { value: "fixed",   label: "Giảm theo số tiền",   suffix: "đ" },
];

const normalizeText = (v) =>
  String(v ?? "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const p = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(p) ? p : 0;
};

const formatCurrency = (v) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.round(toNumber(v) || 0))} đ`;

const STATUS_LABELS = {
  draft:     "Lưu nhập",
  received:  "Đã nhận",
  cancelled: "Đã hủy",
};

export default function WarehouseReceiptFormPage({ mode = "create", receiptId, onCancel, onSaved }) {
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [items, setItems]                 = useState([]);
  const [materials, setMaterials]         = useState([]);
  const [suppliers, setSuppliers]         = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [search, setSearch]               = useState("");
  const [errors, setErrors]               = useState({});
  const [loading, setLoading]             = useState(mode === "edit");
  const [saving, setSaving]               = useState(false);
  const [showSuccess, setShowSuccess]     = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showVatModal, setShowVatModal]   = useState(false);
  const [showOtherFeeModal, setShowOtherFeeModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showMaterialSuggestions, setShowMaterialSuggestions] = useState(false);
  const [discountDraft, setDiscountDraft] = useState({ discount_type: "percent", discount_value: "0" });
  const [shippingFeeDraft, setShippingFeeDraft] = useState("0");
  const [vatPercentDraft, setVatPercentDraft] = useState("0");
  const [otherFeeDraft, setOtherFeeDraft] = useState({ label: "", amount: "0" });
  const [pendingSaved, setPendingSaved]   = useState(null);
  const [receiptHistory, setReceiptHistory] = useState([]);
  const [editStatus, setEditStatus]       = useState("draft");
  const materialSearchRef = useRef(null);

  useEffect(() => {
    api.get("materials/").then((r) => setMaterials(r.data.materials || [])).catch(() => setMaterials([]));
    api.get("suppliers/").then((r) => setSuppliers(r.data.suppliers || [])).catch(() => setSuppliers([]));
    api.get("purchase-orders/").then((r) => setPurchaseOrders(r.data.purchase_orders || [])).catch(() => setPurchaseOrders([]));
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !receiptId) return;
    setLoading(true);
    api
      .get(`warehouse-receipts/${receiptId}/`)
      .then((res) => {
        const r = res.data || {};
        setForm({
          purchase_order:   r.purchase_order !== null && r.purchase_order !== undefined ? String(r.purchase_order) : "",
          supplier:         r.supplier !== null && r.supplier !== undefined ? String(r.supplier) : "",
          responsible_name: r.responsible_name || "",
          receipt_date:     r.receipt_date || "",
          notes:            r.notes || "",
          discount_type:    r.discount_type || "percent",
          discount_value:   String(r.discount_value ?? "0"),
          shipping_fee:     String(r.shipping_fee ?? "0"),
          vat_percent:      String(r.vat_percent ?? "0"),
          other_fee:        String(r.other_fee ?? "0"),
          other_fee_label:  r.other_fee_label || "",
        });
        setItems(
          (r.items || []).map((item) => ({
            id:                String(item.id || ""),
            material_id:       String(item.material_id || ""),
            material_code:     item.material_code || "",
            material_name:     item.material_name || "",
            quantity_ordered:  String(item.quantity_ordered ?? "0"),
            quantity_received: String(item.quantity_received ?? "1"),
            unit:              item.unit || "",
            unit_price:        String(item.unit_price ?? "0"),
            notes:             item.notes || "",
          })),
        );
        setEditStatus(r.status || "draft");
        setReceiptHistory(r.history || []);
      })
      .catch(() => setErrors({ submit: "Không tìm thấy phiếu nhập kho." }))
      .finally(() => setLoading(false));
  }, [mode, receiptId]);

  useEffect(() => {
    if (!showMaterialSuggestions) return undefined;
    const handler = (e) => {
      if (materialSearchRef.current && !materialSearchRef.current.contains(e.target)) {
        setShowMaterialSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMaterialSuggestions]);

  const availableMaterials = useMemo(
    () => materials.filter((m) => !items.some((item) => String(item.material_id) === String(m.id))),
    [items, materials],
  );

  const materialMap = useMemo(
    () => new Map(materials.map((m) => [String(m.id), m])),
    [materials],
  );

  const filteredMaterials = useMemo(() => {
    const kw = normalizeText(search);
    return availableMaterials
      .filter((m) => !kw || normalizeText(m.name).includes(kw) || normalizeText(m.code).includes(kw))
      .slice(0, 8);
  }, [availableMaterials, search]);

  const totals = useMemo(() => {
    const totalGoods     = items.reduce((s, item) => s + toNumber(item.quantity_received) * toNumber(item.unit_price), 0);
    const totalOrdered   = items.reduce((s, item) => s + toNumber(item.quantity_ordered), 0);
    const totalReceived  = items.reduce((s, item) => s + toNumber(item.quantity_received), 0);
    const discountValue  = toNumber(form.discount_value);
    const discountAmount = form.discount_type === "percent" ? (totalGoods * discountValue) / 100 : discountValue;
    const shippingFee    = toNumber(form.shipping_fee);
    const vatPercent     = toNumber(form.vat_percent);
    const vatAmount      = ((totalGoods - Math.min(discountAmount, totalGoods)) * vatPercent) / 100;
    const otherFee       = toNumber(form.other_fee);
    const totalPayable   = Math.max(0, totalGoods - Math.min(discountAmount, totalGoods) + shippingFee + vatAmount + otherFee);

    return { totalGoods, totalOrdered, totalReceived, discountAmount: Math.min(discountAmount, totalGoods), shippingFee, vatPercent, vatAmount, otherFee, totalPayable };
  }, [form.discount_type, form.discount_value, form.other_fee, form.shipping_fee, form.vat_percent, items]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addMaterial = (material) => {
    setItems((prev) => [
      ...prev,
      { ...EMPTY_ITEM, id: `${material.id}-${Date.now()}`, material_id: String(material.id), material_code: material.code || "", material_name: material.name || "", material_image: material.image || "", unit: material.unit || "" },
    ]);
    setSearch("");
    setShowMaterialSuggestions(false);
    if (errors.items) setErrors((prev) => ({ ...prev, items: undefined }));
  };

  const updateItem = (itemId, key, value) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, [key]: value } : item)));
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleReset = () => {
    if (mode === "edit") {
      setLoading(true);
      api.get(`warehouse-receipts/${receiptId}/`).then((res) => {
        const r = res.data || {};
        setForm({
          purchase_order:   r.purchase_order !== null && r.purchase_order !== undefined ? String(r.purchase_order) : "",
          supplier:         r.supplier !== null && r.supplier !== undefined ? String(r.supplier) : "",
          responsible_name: r.responsible_name || "",
          receipt_date:     r.receipt_date || "",
          notes:            r.notes || "",
          discount_type:    r.discount_type || "percent",
          discount_value:   String(r.discount_value ?? "0"),
          shipping_fee:     String(r.shipping_fee ?? "0"),
          vat_percent:      String(r.vat_percent ?? "0"),
          other_fee:        String(r.other_fee ?? "0"),
          other_fee_label:  r.other_fee_label || "",
        });
        setItems((r.items || []).map((item) => ({
          id: String(item.id || ""), material_id: String(item.material_id || ""), material_code: item.material_code || "", material_name: item.material_name || "",
          quantity_ordered: String(item.quantity_ordered ?? "0"), quantity_received: String(item.quantity_received ?? "1"), unit: item.unit || "", unit_price: String(item.unit_price ?? "0"), notes: item.notes || "",
        })));
        setErrors({});
      }).finally(() => setLoading(false));
      return;
    }
    setForm(EMPTY_FORM);
    setItems([]);
    setErrors({});
    setSearch("");
  };

  const validate = (status) => {
    const errs = {};
    if (status === "received") {
      if (!form.supplier) errs.supplier = "Nhà cung cấp là bắt buộc";
      if (items.length === 0) errs.items = "Phiếu nhập kho phải có ít nhất 1 nguyên vật liệu";
    }
    if (toNumber(form.discount_value) < 0) errs.discount_value = "Chiết khấu không được âm";
    if (form.discount_type === "percent" && toNumber(form.discount_value) > 100) errs.discount_value = "Chiết khấu phần trăm không được vượt quá 100%";
    if (toNumber(form.shipping_fee) < 0) errs.shipping_fee = "Phí vận chuyển không được âm";
    if (toNumber(form.vat_percent) < 0) errs.vat_percent = "VAT không được âm";
    if (toNumber(form.vat_percent) > 100) errs.vat_percent = "VAT không được vượt quá 100%";
    if (toNumber(form.other_fee) < 0) errs.other_fee = "Chi phí khác không được âm";
    if (toNumber(form.other_fee) > 0 && !form.other_fee_label.trim()) errs.other_fee_label = "Nội dung chi phí khác là bắt buộc";

    const seen = new Set();
    items.forEach((item, i) => {
      if (toNumber(item.quantity_received) < 0) errs[`item-qty-${i}`] = "Số lượng không được âm";
      if (toNumber(item.unit_price) < 0) errs[`item-price-${i}`] = "Đơn giá không được âm";
      const key = String(item.material_id || "");
      if (key) {
        if (seen.has(key)) errs.items = "Nguyên vật liệu trong phiếu không được trùng nhau";
        seen.add(key);
      }
    });
    return errs;
  };

  const buildPayload = (status) => ({
    purchase_order:  form.purchase_order ? Number(form.purchase_order) : null,
    supplier:        form.supplier ? Number(form.supplier) : null,
    responsible_name: form.responsible_name.trim(),
    receipt_date:    form.receipt_date || null,
    discount_type:   form.discount_type,
    discount_value:  toNumber(form.discount_value),
    shipping_fee:    toNumber(form.shipping_fee),
    vat_percent:     toNumber(form.vat_percent),
    vat_amount:      totals.vatAmount,
    other_fee_label: form.other_fee_label.trim(),
    other_fee:       toNumber(form.other_fee),
    notes:           form.notes.trim(),
    status,
    items: items.map((item) => ({
      material_id:       Number(item.material_id),
      quantity_ordered:  toNumber(item.quantity_ordered),
      quantity_received: toNumber(item.quantity_received),
      unit:              item.unit,
      unit_price:        toNumber(item.unit_price),
      notes:             item.notes?.trim?.() || "",
    })),
  });

  const saveReceipt = async (status) => {
    const errs = validate(status);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));
    try {
      const payload  = buildPayload(status);
      const response = mode === "edit"
        ? await api.put(`warehouse-receipts/${receiptId}/`, payload)
        : await api.post("warehouse-receipts/", payload);
      setPendingSaved(response.data);
      setShowSuccess(true);
    } catch (error) {
      const data = error.response?.data || {};
      if (typeof data === "object" && data !== null) {
        const mapped = {};
        Object.entries(data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : String(v); });
        setErrors((prev) => ({ ...prev, ...mapped }));
      } else {
        setErrors({ submit: "Không thể lưu phiếu nhập kho." });
      }
    } finally {
      setSaving(false);
    }
  };

  const requestCancel = () => { if (!saving) setConfirmAction("cancel"); };
  const requestSave   = (status) => {
    const errs = validate(status);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setConfirmAction(status);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-gray-500">Đang tải dữ liệu phiếu nhập kho...</div>;
  }

  const isEditMode = mode === "edit";

  // ─── group history by date ──────────────────────────────────────────────────
  const groupedHistory = receiptHistory.reduce((acc, h) => {
    const dateStr = h.timestamp ? new Date(h.timestamp).toLocaleDateString("vi-VN") : "Không xác định";
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(h);
    return acc;
  }, {});

  const formatHistoryTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  return (
    <div>
      <div className="mb-6">
        <button onClick={requestCancel} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-2">
          <ChevronLeft size={15} />
          Quay lại danh sách phiếu nhập kho
        </button>
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
          {isEditMode ? "CHỈNH SỬA PHIẾU NHẬP KHO" : "THÊM MỚI PHIẾU NHẬP KHO"}
        </h1>
      </div>

      {errors.submit && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{errors.submit}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.85fr_0.95fr] gap-6">
        {/* ─── Left ─────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Thông tin chung */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">Thông tin chung</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Liên kết phiếu đặt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Liên kết phiếu đặt</label>
                <div className="relative">
                  <select
                    value={form.purchase_order}
                    onChange={(e) => setField("purchase_order", e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 pr-10 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="">Chọn phiếu đặt liên kết</option>
                    {purchaseOrders.map((po) => (
                      <option key={po.id} value={po.id}>{po.code}{po.supplier_name ? ` – ${po.supplier_name}` : ""}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Nhà cung cấp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nhà cung cấp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.supplier}
                    onChange={(e) => setField("supplier", e.target.value)}
                    className={`w-full appearance-none px-3 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                      errors.supplier ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.supplier && <p className="mt-1 text-xs text-red-500">{errors.supplier}</p>}
              </div>

              {/* Ngày nhập hàng */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày nhập hàng</label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.receipt_date}
                    onChange={(e) => setField("receipt_date", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Người phụ trách */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Người phụ trách</label>
                <input
                  type="text"
                  value={form.responsible_name}
                  onChange={(e) => setField("responsible_name", e.target.value)}
                  placeholder="Nhập người phụ trách"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              {/* Trạng thái — only in edit mode */}
              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 pr-10 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                        <option key={val} value={val}>{lbl}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nguyên vật liệu */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Nguyên vật liệu <span className="text-red-500">*</span>
            </h2>

            <div className="flex gap-3 mb-4">
              <div className="relative flex-1" ref={materialSearchRef}>
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onFocus={() => setShowMaterialSuggestions(true)}
                  onClick={() => setShowMaterialSuggestions(true)}
                  onChange={(e) => { setSearch(e.target.value); setShowMaterialSuggestions(true); }}
                  placeholder="Tìm kiếm nguyên vật liệu"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                {showMaterialSuggestions && filteredMaterials.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                    {filteredMaterials.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => addMaterial(m)}
                        className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b last:border-b-0 border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <MaterialAvatar material={m} />
                          <div>
                            <div className="text-sm font-medium text-gray-800">{m.name}</div>
                            <div className="text-xs text-gray-500">{m.code} · {m.unit}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showMaterialSuggestions && filteredMaterials.length === 0 && materials.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden px-4 py-3 text-sm text-gray-500">
                    Không tìm thấy nguyên vật liệu phù hợp.
                  </div>
                )}
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: "#E67E22" }}
              >
                <Upload size={14} />
                Nhập file danh sách
              </button>
            </div>

            {errors.items && <p className="mb-3 text-xs text-red-500">{errors.items}</p>}

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-16 text-center">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-sm text-gray-400">Bạn chưa thêm nguyên vật liệu nào</p>
                <p className="mt-1 text-xs text-gray-400">Tìm kiếm nguyên vật liệu ở ô phía trên để thêm vào phiếu nhập kho.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                <div className="hidden md:grid grid-cols-[minmax(0,1.7fr)_130px_130px_170px_140px_44px] gap-3 px-3 py-3 text-sm font-semibold text-gray-800 border-b border-gray-100">
                  <div>Nguyên vật liệu</div>
                  <div className="text-center">SL đặt</div>
                  <div className="text-center">SL nhận</div>
                  <div className="text-center">Đơn giá</div>
                  <div className="text-right">Thành tiền</div>
                  <div />
                </div>
                <div className="divide-y divide-dashed divide-gray-200">
                  {items.map((item, index) => {
                    const meta = materialMap.get(String(item.material_id));
                    const dm   = { name: item.material_name || meta?.name || "Chưa chọn NVL", code: item.material_code || meta?.code || "", unit: item.unit || meta?.unit || "", image: item.material_image || meta?.image || "" };
                    return (
                      <div key={item.id} className="px-3 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.7fr)_130px_130px_170px_140px_44px] gap-3 items-center">
                          <div className="flex items-center gap-4 min-w-0">
                            <MaterialAvatar material={dm} size="lg" />
                            <div className="min-w-0">
                              <div className="text-lg font-medium text-gray-900 truncate">{dm.name}</div>
                              <div className="mt-1 text-sm text-gray-500 truncate">{dm.code}{dm.unit ? ` · ${dm.unit}` : ""}</div>
                            </div>
                          </div>
                          {/* SL đặt */}
                          <div>
                            <input
                              type="number" min="0" step="0.001"
                              value={item.quantity_ordered}
                              onChange={(e) => updateItem(item.id, "quantity_ordered", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                            />
                          </div>
                          {/* SL nhận */}
                          <div>
                            <input
                              type="number" min="0" step="0.001"
                              value={item.quantity_received}
                              onChange={(e) => updateItem(item.id, "quantity_received", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                            />
                            {errors[`item-qty-${index}`] && <p className="mt-1 text-xs text-red-500 text-center">{errors[`item-qty-${index}`]}</p>}
                          </div>
                          {/* Đơn giá */}
                          <div>
                            <div className="relative">
                              <input
                                type="number" min="0" step="1"
                                value={item.unit_price}
                                onChange={(e) => updateItem(item.id, "unit_price", e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 pr-10 text-center text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-gray-400">đ</span>
                            </div>
                            {errors[`item-price-${index}`] && <p className="mt-1 text-xs text-red-500 text-center">{errors[`item-price-${index}`]}</p>}
                          </div>
                          {/* Thành tiền */}
                          <div className="text-right text-[16px] font-semibold text-gray-900">
                            {formatCurrency(toNumber(item.quantity_received) * toNumber(item.unit_price))}
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                          placeholder="Ghi chú dòng nguyên vật liệu"
                          className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Lịch sử — edit mode only */}
          {isEditMode && receiptHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">Lịch sử</h2>
              <div className="space-y-5">
                {Object.entries(groupedHistory).map(([date, entries]) => (
                  <div key={date}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{date}</p>
                    <div className="space-y-3">
                      {entries.map((h) => (
                        <div key={h.id} className="flex items-start gap-3">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-700">{h.action}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatHistoryTime(h.timestamp)}{h.actor_name ? ` · ${h.actor_name}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Right ────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Chi phí thanh toán */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">Chi phí thanh toán</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-700">
                <span>Số lượng đặt</span>
                <span className="font-semibold">{new Intl.NumberFormat("vi-VN").format(totals.totalOrdered)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Số lượng nhận</span>
                <span className="font-semibold">{new Intl.NumberFormat("vi-VN").format(totals.totalReceived)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Tổng tiền hàng</span>
                <span className="font-semibold">{formatCurrency(totals.totalGoods)}</span>
              </div>
              <button type="button" onClick={() => { setDiscountDraft({ discount_type: form.discount_type, discount_value: form.discount_value }); setShowDiscountModal(true); }}
                className="w-full flex items-center justify-between text-left text-orange-500 hover:text-orange-600 transition-colors">
                <span>Chiết khấu đơn</span>
                <span className="font-semibold">{formatCurrency(totals.discountAmount)}</span>
              </button>
              <button type="button" onClick={() => { setShippingFeeDraft(form.shipping_fee); setShowShippingModal(true); }}
                className="w-full flex items-center justify-between text-left text-orange-500 hover:text-orange-600 transition-colors">
                <span>Phí vận chuyển</span>
                <span className="font-semibold">{formatCurrency(totals.shippingFee)}</span>
              </button>
              <button type="button" onClick={() => { setVatPercentDraft(form.vat_percent); setShowVatModal(true); }}
                className="w-full flex items-center justify-between text-left text-orange-500 hover:text-orange-600 transition-colors">
                <span>VAT</span>
                <span className="font-semibold">{formatCurrency(totals.vatAmount)}</span>
              </button>
              <button type="button" onClick={() => { setOtherFeeDraft({ label: form.other_fee_label, amount: form.other_fee }); setShowOtherFeeModal(true); }}
                className="w-full flex items-center justify-between text-left text-orange-500 hover:text-orange-600 transition-colors">
                <span>{form.other_fee_label || "Chi phí khác"}</span>
                <span className="font-semibold">{formatCurrency(totals.otherFee)}</span>
              </button>
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-gray-900">
                <span className="font-medium">Tiền cần trả NCC</span>
                <span className="text-lg font-bold text-gray-800">{formatCurrency(totals.totalPayable)}</span>
              </div>
            </div>
            {(errors.discount_value || errors.shipping_fee || errors.vat_percent || errors.other_fee || errors.other_fee_label) && (
              <div className="mt-3 space-y-1">
                {errors.discount_value  && <p className="text-xs text-red-500">{errors.discount_value}</p>}
                {errors.shipping_fee    && <p className="text-xs text-red-500">{errors.shipping_fee}</p>}
                {errors.vat_percent     && <p className="text-xs text-red-500">{errors.vat_percent}</p>}
                {errors.other_fee       && <p className="text-xs text-red-500">{errors.other_fee}</p>}
                {errors.other_fee_label && <p className="text-xs text-red-500">{errors.other_fee_label}</p>}
              </div>
            )}
          </div>

          {/* Ghi chú */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">Ghi chú</h2>
            <textarea
              rows={6}
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Nhập ghi chú..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={handleReset} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <RotateCcw size={15} />
          Làm mới
        </button>
        <button type="button" onClick={requestCancel} className="px-5 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          Hủy bỏ
        </button>
        {!isEditMode && (
          <button type="button" onClick={() => requestSave("draft")} className="px-5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            Lưu nháp
          </button>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={() => requestSave(isEditMode ? editStatus : "received")}
          className="px-5 py-2.5 text-sm rounded-lg text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: "#E67E22" }}
        >
          {saving ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Xác nhận nhập"}
        </button>
      </div>

      {/* ─── Discount Modal ─────────────────────────────────── */}
      {showDiscountModal && (
        <ModalWrapper title="Chiết khấu" onClose={() => setShowDiscountModal(false)}>
          <div className="px-5 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <select
                  value={discountDraft.discount_type}
                  onChange={(e) => setDiscountDraft((p) => ({ ...p, discount_type: e.target.value }))}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  {DISCOUNT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              <div className="relative">
                <input
                  type="number" min="0" step={discountDraft.discount_type === "percent" ? "0.01" : "1"}
                  value={discountDraft.discount_value}
                  onChange={(e) => setDiscountDraft((p) => ({ ...p, discount_value: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-700">
                  {DISCOUNT_OPTIONS.find((o) => o.value === discountDraft.discount_type)?.suffix}
                </span>
              </div>
            </div>
          </div>
          <ModalFooter
            onReset={() => setDiscountDraft({ discount_type: "percent", discount_value: "0" })}
            onClose={() => setShowDiscountModal(false)}
            onSave={() => { setField("discount_type", discountDraft.discount_type); setField("discount_value", discountDraft.discount_value); setShowDiscountModal(false); }}
          />
        </ModalWrapper>
      )}

      {showShippingModal && (
        <SimpleValueModal title="Phí vận chuyển" value={shippingFeeDraft} suffix="đ"
          onChange={setShippingFeeDraft} onReset={() => setShippingFeeDraft("0")}
          onClose={() => setShowShippingModal(false)}
          onSave={() => { setField("shipping_fee", shippingFeeDraft); setShowShippingModal(false); }} />
      )}

      {showVatModal && (
        <SimpleValueModal title="Thuế VAT" value={vatPercentDraft} suffix="%"
          onChange={setVatPercentDraft} onReset={() => setVatPercentDraft("0")}
          onClose={() => setShowVatModal(false)}
          onSave={() => { setField("vat_percent", vatPercentDraft); setShowVatModal(false); }} />
      )}

      {showOtherFeeModal && (
        <OtherFeeModal value={otherFeeDraft} onChange={setOtherFeeDraft}
          onReset={() => setOtherFeeDraft({ label: "", amount: "0" })}
          onClose={() => setShowOtherFeeModal(false)}
          onSave={() => { setField("other_fee_label", otherFeeDraft.label); setField("other_fee", otherFeeDraft.amount); setShowOtherFeeModal(false); }} />
      )}

      {/* ─── Confirm action modal ──────────────────────────── */}
      {confirmAction && (
        <ActionConfirmModal
          title={
            confirmAction === "cancel"    ? "Bạn có chắc muốn hủy?" :
            confirmAction === "draft"     ? "Lưu nháp phiếu nhập kho?" :
            isEditMode                    ? "Cập nhật phiếu nhập kho?" :
                                            "Xác nhận tạo phiếu nhập kho?"
          }
          message={
            confirmAction === "cancel"    ? "Thay đổi chưa được lưu sẽ bị mất." :
            confirmAction === "draft"     ? "Phiếu sẽ được lưu ở trạng thái nháp và có thể chỉnh sửa tiếp." :
                                            "Phiếu sau khi lưu sẽ được ghi nhận vào danh sách phiếu nhập kho."
          }
          note={
            confirmAction === "cancel"    ? "Bạn có thể quay lại để tiếp tục chỉnh sửa." :
                                            "Vui lòng kiểm tra lại thông tin trước khi tiếp tục."
          }
          confirmLabel="Tiếp tục"
          cancelLabel="Không, quay lại"
          loading={saving}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction === "cancel") { setConfirmAction(null); onCancel?.(); return; }
            const action = confirmAction;
            setConfirmAction(null);
            saveReceipt(action === "draft" ? "draft" : (isEditMode ? editStatus : "received"));
          }}
        />
      )}

      {/* ─── Success modal ─────────────────────────────────── */}
      {showSuccess && (
        <SuccessModal
          message={isEditMode ? "Cập nhật phiếu nhập kho thành công!" : "Tạo phiếu nhập kho thành công!"}
          onClose={() => {
            setShowSuccess(false);
            if (pendingSaved) {
              if (isEditMode) {
                // Stay on edit page, refresh history from response
                setReceiptHistory(pendingSaved.history || []);
                setEditStatus(pendingSaved.status || editStatus);
              }
              onSaved?.(pendingSaved);
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ModalWrapper({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#13162D]">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onReset, onClose, onSave }) {
  return (
    <div className="px-5 pb-5 flex items-center justify-between gap-3">
      <button type="button" onClick={onReset} className="inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-300 hover:text-gray-500 transition-colors">
        <RotateCcw size={20} />
      </button>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Hủy</button>
        <button type="button" onClick={onSave} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: "#F58220" }}>Lưu</button>
      </div>
    </div>
  );
}

function SimpleValueModal({ title, value, suffix, onChange, onReset, onClose, onSave }) {
  return (
    <ModalWrapper title={title} onClose={onClose}>
      <div className="px-5 py-5">
        <div className="relative">
          <input type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-700">{suffix}</span>
        </div>
      </div>
      <ModalFooter onReset={onReset} onClose={onClose} onSave={onSave} />
    </ModalWrapper>
  );
}

function OtherFeeModal({ value, onChange, onReset, onClose, onSave }) {
  return (
    <ModalWrapper title="Chi phí khác" onClose={onClose}>
      <div className="px-5 py-5 grid grid-cols-1 gap-4">
        <input type="text" value={value.label} onChange={(e) => onChange((p) => ({ ...p, label: e.target.value }))}
          placeholder="Nhập nội dung"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        <div className="relative">
          <input type="number" min="0" step="1" value={value.amount} onChange={(e) => onChange((p) => ({ ...p, amount: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-700">đ</span>
        </div>
      </div>
      <ModalFooter onReset={onReset} onClose={onClose} onSave={onSave} />
    </ModalWrapper>
  );
}

function MaterialAvatar({ material, size = "md" }) {
  const image  = material?.image || "";
  const label  = String(material?.name || "NVL").trim();
  const initial = label.charAt(0).toUpperCase() || "N";
  const szCls  = size === "lg" ? "w-14 h-14 rounded-xl" : "w-10 h-10 rounded-lg";
  if (image) {
    return <img src={image} alt={label} className={`${szCls} object-cover border border-gray-200 bg-white flex-shrink-0`} />;
  }
  return (
    <div className={`${szCls} border border-gray-200 bg-orange-50 text-orange-500 flex items-center justify-center font-semibold flex-shrink-0`}>
      {initial}
    </div>
  );
}
