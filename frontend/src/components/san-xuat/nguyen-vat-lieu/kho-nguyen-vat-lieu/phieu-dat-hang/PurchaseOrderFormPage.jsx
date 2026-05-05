import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../../../../../api/axios";
import ActionConfirmModal from "../../../../common/ActionConfirmModal";
import SuccessModal from "../../../../common/SuccessModal";

const EMPTY_FORM = {
  supplier: "",
  responsible_name: "",
  order_date: "",
  expected_delivery_date: "",
  notes: "",
  discount_type: "percent",
  discount_value: "0",
  shipping_fee: "0",
  vat_percent: "0",
  other_fee: "0",
  other_fee_label: "",
};

const EMPTY_ITEM = {
  material_id: "",
  material_code: "",
  material_name: "",
  material_image: "",
  quantity: "1",
  unit: "",
  unit_price: "0",
  notes: "",
};

const DISCOUNT_OPTIONS = [
  { value: "percent", label: "Giảm theo phần trăm", suffix: "%" },
  { value: "fixed", label: "Giảm theo số tiền", suffix: "đ" },
];

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.round(toNumber(value) || 0))} đ`;

export default function PurchaseOrderFormPage({
  mode = "create",
  purchaseOrderId,
  onCancel,
  onSaved,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showVatModal, setShowVatModal] = useState(false);
  const [showOtherFeeModal, setShowOtherFeeModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showMaterialSuggestions, setShowMaterialSuggestions] = useState(false);
  const [discountDraft, setDiscountDraft] = useState({
    discount_type: "percent",
    discount_value: "0",
  });
  const [shippingFeeDraft, setShippingFeeDraft] = useState("0");
  const [vatPercentDraft, setVatPercentDraft] = useState("0");
  const [otherFeeDraft, setOtherFeeDraft] = useState({
    label: "",
    amount: "0",
  });
  const [pendingSavedOrder, setPendingSavedOrder] = useState(null);
  const materialSearchRef = useRef(null);

  useEffect(() => {
    api
      .get("materials/")
      .then((res) => setMaterials(res.data.materials || []))
      .catch(() => setMaterials([]));

    api
      .get("suppliers/")
      .then((res) => setSuppliers(res.data.suppliers || []))
      .catch(() => setSuppliers([]));
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !purchaseOrderId) return;
    setLoading(true);
    api
      .get(`purchase-orders/${purchaseOrderId}/`)
      .then((res) => {
        const order = res.data || {};
        setForm({
          supplier:
            order.supplier !== null && order.supplier !== undefined
              ? String(order.supplier)
              : "",
          responsible_name: order.responsible_name || "",
          order_date: order.order_date || "",
          expected_delivery_date: order.expected_delivery_date || "",
          notes: order.notes || "",
          discount_type: order.discount_type || "percent",
          discount_value: String(order.discount_value ?? "0"),
          shipping_fee: String(order.shipping_fee ?? "0"),
          vat_percent: String(order.vat_percent ?? "0"),
          other_fee: String(order.other_fee ?? "0"),
          other_fee_label: order.other_fee_label || "",
        });
        setItems(
          (order.items || []).map((item) => ({
            id: item.id,
            material_id: String(item.material_id || ""),
            material_code: item.material_code || "",
            material_name: item.material_name || "",
            quantity: String(item.quantity ?? "1"),
            unit: item.unit || "",
            unit_price: String(item.unit_price ?? "0"),
            notes: item.notes || "",
          })),
        );
      })
      .catch(() => setErrors({ submit: "Không tìm thấy phiếu đặt hàng." }))
      .finally(() => setLoading(false));
  }, [mode, purchaseOrderId]);

  useEffect(() => {
    if (!showMaterialSuggestions) return undefined;
    const handleClickOutside = (event) => {
      if (
        materialSearchRef.current &&
        !materialSearchRef.current.contains(event.target)
      ) {
        setShowMaterialSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMaterialSuggestions]);

  const availableMaterials = useMemo(
    () =>
      materials.filter(
        (material) =>
          !items.some(
            (item) => String(item.material_id) === String(material.id),
          ),
      ),
    [items, materials],
  );

  const materialMap = useMemo(
    () => new Map(materials.map((material) => [String(material.id), material])),
    [materials],
  );

  const filteredMaterials = useMemo(() => {
    const keyword = normalizeText(search);
    const source = availableMaterials.filter((material) => {
      if (!keyword) return true;
      return (
        normalizeText(material.name).includes(keyword) ||
        normalizeText(material.code).includes(keyword)
      );
    });
    return source
      .filter((material) => {
        const itemKey = String(material.id || "");
        return itemKey;
      })
      .slice(0, 8);
  }, [availableMaterials, search]);

  const totals = useMemo(() => {
    const totalGoods = items.reduce(
      (sum, item) => sum + toNumber(item.quantity) * toNumber(item.unit_price),
      0,
    );
    const discountValue = toNumber(form.discount_value);
    const discountAmount =
      form.discount_type === "percent"
        ? (totalGoods * discountValue) / 100
        : discountValue;
    const shippingFee = toNumber(form.shipping_fee);
    const vatPercent = toNumber(form.vat_percent);
    const vatAmount =
      ((totalGoods - Math.min(discountAmount, totalGoods)) * vatPercent) / 100;
    const otherFee = toNumber(form.other_fee);
    const totalPayable = Math.max(
      0,
      totalGoods -
        Math.min(discountAmount, totalGoods) +
        shippingFee +
        vatAmount +
        otherFee,
    );

    return {
      totalGoods,
      discountAmount: Math.min(discountAmount, totalGoods),
      shippingFee,
      vatPercent,
      vatAmount,
      otherFee,
      totalPayable,
    };
  }, [
    form.discount_type,
    form.discount_value,
    form.other_fee,
    form.shipping_fee,
    form.vat_percent,
    items,
  ]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addMaterial = (material) => {
    setItems((prev) => [
      ...prev,
      {
        ...EMPTY_ITEM,
        id: `${material.id}-${Date.now()}`,
        material_id: String(material.id),
        material_code: material.code || "",
        material_name: material.name || "",
        material_image: material.image || "",
        unit: material.unit || "",
      },
    ]);
    setSearch("");
    setShowMaterialSuggestions(false);
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

  const handleReset = () => {
    if (mode === "edit") {
      setLoading(true);
      api
        .get(`purchase-orders/${purchaseOrderId}/`)
        .then((res) => {
          const order = res.data || {};
          setForm({
            supplier:
              order.supplier !== null && order.supplier !== undefined
                ? String(order.supplier)
                : "",
            responsible_name: order.responsible_name || "",
            order_date: order.order_date || "",
            expected_delivery_date: order.expected_delivery_date || "",
            notes: order.notes || "",
            discount_type: order.discount_type || "percent",
            discount_value: String(order.discount_value ?? "0"),
            shipping_fee: String(order.shipping_fee ?? "0"),
            vat_percent: String(order.vat_percent ?? "0"),
            other_fee: String(order.other_fee ?? "0"),
            other_fee_label: order.other_fee_label || "",
          });
          setItems(
            (order.items || []).map((item) => ({
              id: item.id,
              material_id: String(item.material_id || ""),
              material_code: item.material_code || "",
              material_name: item.material_name || "",
              material_image: "",
              quantity: String(item.quantity ?? "1"),
              unit: item.unit || "",
              unit_price: String(item.unit_price ?? "0"),
              notes: item.notes || "",
            })),
          );
          setErrors({});
        })
        .finally(() => setLoading(false));
      return;
    }
    setForm(EMPTY_FORM);
    setItems([]);
    setErrors({});
    setSearch("");
  };

  const validate = (status) => {
    const nextErrors = {};
    if (status !== "draft") {
      if (!form.supplier) nextErrors.supplier = "Nhà cung cấp là bắt buộc";
      if (!form.responsible_name.trim()) {
        nextErrors.responsible_name = "Người phụ trách là bắt buộc";
      }
      if (!form.order_date) nextErrors.order_date = "Ngày đặt hàng là bắt buộc";
      if (!form.expected_delivery_date) {
        nextErrors.expected_delivery_date = "Ngày về kho dự kiến là bắt buộc";
      }
      if (items.length === 0) {
        nextErrors.items = "Phiếu đặt hàng phải có ít nhất 1 nguyên vật liệu";
      }
    }

    if (
      form.order_date &&
      form.expected_delivery_date &&
      new Date(form.expected_delivery_date) < new Date(form.order_date)
    ) {
      nextErrors.expected_delivery_date =
        "Ngày về kho dự kiến phải từ ngày đặt hàng trở đi";
    }

    if (toNumber(form.discount_value) < 0) {
      nextErrors.discount_value = "Chiết khấu không được âm";
    }
    if (
      form.discount_type === "percent" &&
      toNumber(form.discount_value) > 100
    ) {
      nextErrors.discount_value =
        "Chiết khấu phần trăm không được vượt quá 100%";
    }
    if (toNumber(form.shipping_fee) < 0) {
      nextErrors.shipping_fee = "Phí vận chuyển không được âm";
    }
    if (toNumber(form.vat_percent) < 0) {
      nextErrors.vat_percent = "VAT không được âm";
    }
    if (toNumber(form.vat_percent) > 100) {
      nextErrors.vat_percent = "VAT không được vượt quá 100%";
    }
    if (toNumber(form.other_fee) < 0) {
      nextErrors.other_fee = "Chi phí khác không được âm";
    }
    if (toNumber(form.other_fee) > 0 && !form.other_fee_label.trim()) {
      nextErrors.other_fee_label = "Nội dung chi phí khác là bắt buộc";
    }

    const seen = new Set();
    items.forEach((item, index) => {
      if (!item.material_id) {
        nextErrors[`item-material-${index}`] = "Nguyên vật liệu là bắt buộc";
      }
      if (toNumber(item.quantity) <= 0) {
        nextErrors[`item-quantity-${index}`] = "Số lượng phải lớn hơn 0";
      }
      if (toNumber(item.unit_price) < 0) {
        nextErrors[`item-price-${index}`] = "Đơn giá không được âm";
      }
      const key = String(item.material_id || "");
      if (key) {
        if (seen.has(key))
          nextErrors.items =
            "Nguyên vật liệu trong phiếu không được trùng nhau";
        seen.add(key);
      }
    });

    return nextErrors;
  };

  const buildPayload = (status) => ({
    supplier: form.supplier ? Number(form.supplier) : null,
    responsible_name: form.responsible_name.trim(),
    order_date: form.order_date || null,
    expected_delivery_date: form.expected_delivery_date || null,
    discount_type: form.discount_type,
    discount_value: toNumber(form.discount_value),
    shipping_fee: toNumber(form.shipping_fee),
    vat_percent: toNumber(form.vat_percent),
    vat_amount: totals.vatAmount,
    other_fee_label: form.other_fee_label.trim(),
    other_fee: toNumber(form.other_fee),
    notes: form.notes.trim(),
    status,
    items: items.map((item) => ({
      material_id: Number(item.material_id),
      quantity: toNumber(item.quantity),
      unit: item.unit,
      unit_price: toNumber(item.unit_price),
      notes: item.notes?.trim?.() || "",
    })),
  });

  const saveOrder = async (status) => {
    const nextErrors = validate(status);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));
    try {
      const payload = buildPayload(status);
      const response =
        mode === "edit"
          ? await api.put(`purchase-orders/${purchaseOrderId}/`, payload)
          : await api.post("purchase-orders/", payload);
      setPendingSavedOrder(response.data);
      setShowSuccess(true);
    } catch (error) {
      const data = error.response?.data || {};
      if (typeof data === "object" && data !== null) {
        const mapped = {};
        Object.entries(data).forEach(([key, value]) => {
          mapped[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setErrors((prev) => ({ ...prev, ...mapped }));
      } else {
        setErrors({ submit: "Không thể lưu phiếu đặt hàng." });
      }
    } finally {
      setSaving(false);
    }
  };

  const requestCancel = () => {
    if (saving) return;
    setConfirmAction("cancel");
  };

  const requestSave = (status) => {
    const nextErrors = validate(status);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setConfirmAction(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        Đang tải dữ liệu phiếu đặt hàng...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={requestCancel}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-2"
        >
          <ChevronLeft size={15} />
          Quay lại danh sách phiếu đặt hàng
        </button>
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
          {mode === "edit"
            ? "CHỈNH SỬA PHIẾU ĐẶT HÀNG"
            : "THÊM MỚI PHIẾU ĐẶT HÀNG"}
        </h1>
      </div>

      {errors.submit && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.85fr_0.95fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Thông tin chung
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nhà cung cấp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.supplier}
                    onChange={(e) => setField("supplier", e.target.value)}
                    className={`w-full appearance-none px-3 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                      errors.supplier
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.supplier && (
                  <p className="mt-1 text-xs text-red-500">{errors.supplier}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Người phụ trách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.responsible_name}
                  onChange={(e) => setField("responsible_name", e.target.value)}
                  placeholder="Nhập người phụ trách"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                    errors.responsible_name
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.responsible_name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.responsible_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ngày đặt hàng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.order_date}
                    onChange={(e) => setField("order_date", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                      errors.order_date
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  <Calendar
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.order_date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.order_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ngày về kho dự kiến <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.expected_delivery_date}
                    onChange={(e) =>
                      setField("expected_delivery_date", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                      errors.expected_delivery_date
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  <Calendar
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.expected_delivery_date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.expected_delivery_date}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                Nguyên vật liệu
              </h2>
            </div>

            <div className="relative mb-4" ref={materialSearchRef}>
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onFocus={() => setShowMaterialSuggestions(true)}
                onClick={() => setShowMaterialSuggestions(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowMaterialSuggestions(true);
                }}
                placeholder="Tìm kiếm nguyên vật liệu"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              {showMaterialSuggestions && filteredMaterials.length > 0 && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                  {filteredMaterials.map((material) => (
                    <button
                      key={material.id}
                      type="button"
                      onClick={() => addMaterial(material)}
                      className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b last:border-b-0 border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <MaterialAvatar material={material} />
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {material.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {material.code} · {material.unit}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showMaterialSuggestions &&
                filteredMaterials.length === 0 &&
                materials.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden px-4 py-3 text-sm text-gray-500">
                    Không tìm thấy nguyên vật liệu phù hợp.
                  </div>
                )}
            </div>

            {materials.length === 0 && (
              <div className="mb-4 rounded-lg border border-dashed border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-600">
                Chưa có nguyên vật liệu nào trong hệ thống để liên kết với phiếu
                đặt hàng.
              </div>
            )}

            {errors.items && (
              <p className="mb-3 text-xs text-red-500">{errors.items}</p>
            )}

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center">
                <p className="text-sm text-gray-400">
                  Bạn chưa thêm nguyên vật liệu nào
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Tìm kiếm nguyên vật liệu ở ô phía trên để thêm vào phiếu đặt
                  hàng.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                <div className="hidden md:grid grid-cols-[minmax(0,1.7fr)_140px_170px_140px_44px] gap-4 px-3 py-3 text-sm font-semibold text-gray-800 border-b border-gray-100">
                  <div>Nguyên vật liệu</div>
                  <div className="text-center">Số lượng</div>
                  <div className="text-center">Đơn giá</div>
                  <div className="text-right">Thành tiền</div>
                  <div />
                </div>
                <div className="divide-y divide-dashed divide-gray-200">
                  {items.map((item, index) => {
                    const materialMeta = materialMap.get(
                      String(item.material_id),
                    );
                    const displayMaterial = {
                      name:
                        item.material_name ||
                        materialMeta?.name ||
                        "Chưa chọn NVL",
                      code: item.material_code || materialMeta?.code || "",
                      unit: item.unit || materialMeta?.unit || "",
                      image: item.material_image || materialMeta?.image || "",
                    };
                    return (
                      <div key={item.id} className="px-3 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.7fr)_140px_170px_140px_44px] gap-4 items-center">
                          <div className="flex items-center gap-4 min-w-0">
                            <MaterialAvatar
                              material={displayMaterial}
                              size="lg"
                            />
                            <div className="min-w-0">
                              <div className="text-lg font-medium text-gray-900 truncate">
                                {displayMaterial.name}
                              </div>
                              <div className="mt-1 text-sm text-gray-500 truncate">
                                {displayMaterial.code}
                                {displayMaterial.unit
                                  ? ` · ${displayMaterial.unit}`
                                  : ""}
                              </div>
                            </div>
                          </div>
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="0.001"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(item.id, "quantity", e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-[18px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                            />
                            {errors[`item-quantity-${index}`] && (
                              <p className="mt-1 text-xs text-red-500 text-center">
                                {errors[`item-quantity-${index}`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={item.unit_price}
                                onChange={(e) =>
                                  updateItem(
                                    item.id,
                                    "unit_price",
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-center text-[18px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                                đ
                              </span>
                            </div>
                            {errors[`item-price-${index}`] && (
                              <p className="mt-1 text-xs text-red-500 text-center">
                                {errors[`item-price-${index}`]}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-[18px] font-semibold text-gray-900">
                            {formatCurrency(
                              toNumber(item.quantity) *
                                toNumber(item.unit_price),
                            )}
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                              title="Xóa nguyên vật liệu"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) =>
                            updateItem(item.id, "notes", e.target.value)
                          }
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
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Chi phí đặt hàng
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-700">
                <span>Số lượng đặt</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("vi-VN").format(items.length)}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Tổng tiền hàng</span>
                <span className="font-semibold">
                  {formatCurrency(totals.totalGoods)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDiscountDraft({
                    discount_type: form.discount_type,
                    discount_value: form.discount_value,
                  });
                  setShowDiscountModal(true);
                }}
                className="w-full flex items-center justify-between text-left text-orange-500 hover:text-orange-600 transition-colors"
              >
                <span>Chiết khấu</span>
                <span className="font-semibold">
                  {formatCurrency(totals.discountAmount)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShippingFeeDraft(form.shipping_fee);
                  setShowShippingModal(true);
                }}
                className="w-full flex items-center justify-between text-left text-orange-500 hover:text-orange-600 transition-colors"
              >
                <span>Phí vận chuyển</span>
                <span className="font-semibold">
                  {formatCurrency(totals.shippingFee)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVatPercentDraft(form.vat_percent);
                  setShowVatModal(true);
                }}
                className="w-full flex items-center justify-between text-left text-orange-500 hover:text-orange-600 transition-colors"
              >
                <span>VAT</span>
                <span className="font-semibold">
                  {formatCurrency(totals.vatAmount)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtherFeeDraft({
                    label: form.other_fee_label,
                    amount: form.other_fee,
                  });
                  setShowOtherFeeModal(true);
                }}
                className="w-full flex items-center justify-between text-left text-orange-500 hover:text-orange-600 transition-colors"
              >
                <span>{form.other_fee_label || "Chi phí khác"}</span>
                <span className="font-semibold">
                  {formatCurrency(totals.otherFee)}
                </span>
              </button>
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-gray-900">
                <span className="font-medium">Tiền cần trả NCC</span>
                <span className="text-lg font-bold text-gray-800">
                  {formatCurrency(totals.totalPayable)}
                </span>
              </div>
            </div>

            {(errors.discount_value ||
              errors.shipping_fee ||
              errors.vat_percent ||
              errors.other_fee ||
              errors.other_fee_label) && (
              <div className="mt-3 space-y-1">
                {errors.discount_value && (
                  <p className="text-xs text-red-500">
                    {errors.discount_value}
                  </p>
                )}
                {errors.shipping_fee && (
                  <p className="text-xs text-red-500">{errors.shipping_fee}</p>
                )}
                {errors.vat_percent && (
                  <p className="text-xs text-red-500">{errors.vat_percent}</p>
                )}
                {errors.other_fee && (
                  <p className="text-xs text-red-500">{errors.other_fee}</p>
                )}
                {errors.other_fee_label && (
                  <p className="text-xs text-red-500">
                    {errors.other_fee_label}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Ghi chú
            </h2>
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

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={15} />
          Làm mới
        </button>
        <button
          type="button"
          onClick={requestCancel}
          className="px-5 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => requestSave("draft")}
          className="px-5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Lưu nháp
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => requestSave(mode === "edit" ? "waiting" : "waiting")}
          className="px-5 py-2.5 text-sm rounded-lg text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: "#E67E22" }}
        >
          {saving ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Thêm"}
        </button>
      </div>

      {showDiscountModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowDiscountModal(false);
          }}
        >
          <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#13162D]">
                Chiết khấu
              </h3>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    value={discountDraft.discount_type}
                    onChange={(e) =>
                      setDiscountDraft((prev) => ({
                        ...prev,
                        discount_type: e.target.value,
                      }))
                    }
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    {DISCOUNT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step={
                      discountDraft.discount_type === "percent" ? "0.01" : "1"
                    }
                    value={discountDraft.discount_value}
                    onChange={(e) =>
                      setDiscountDraft((prev) => ({
                        ...prev,
                        discount_value: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-700">
                    {
                      DISCOUNT_OPTIONS.find(
                        (option) =>
                          option.value === discountDraft.discount_type,
                      )?.suffix
                    }
                  </span>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setDiscountDraft({
                    discount_type: "percent",
                    discount_value: "0",
                  })
                }
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-300 hover:text-gray-500 transition-colors"
              >
                <RotateCcw size={20} />
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setField("discount_type", discountDraft.discount_type);
                    setField("discount_value", discountDraft.discount_value);
                    setShowDiscountModal(false);
                  }}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#F58220" }}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShippingModal && (
        <SimpleValueModal
          title="Phí vận chuyển"
          value={shippingFeeDraft}
          suffix="đ"
          onChange={setShippingFeeDraft}
          onReset={() => setShippingFeeDraft("0")}
          onClose={() => setShowShippingModal(false)}
          onSave={() => {
            setField("shipping_fee", shippingFeeDraft);
            setShowShippingModal(false);
          }}
        />
      )}

      {showVatModal && (
        <SimpleValueModal
          title="Thuế VAT"
          value={vatPercentDraft}
          suffix="%"
          onChange={setVatPercentDraft}
          onReset={() => setVatPercentDraft("0")}
          onClose={() => setShowVatModal(false)}
          onSave={() => {
            setField("vat_percent", vatPercentDraft);
            setShowVatModal(false);
          }}
        />
      )}

      {showOtherFeeModal && (
        <OtherFeeModal
          value={otherFeeDraft}
          onChange={setOtherFeeDraft}
          onReset={() =>
            setOtherFeeDraft({
              label: "",
              amount: "0",
            })
          }
          onClose={() => setShowOtherFeeModal(false)}
          onSave={() => {
            setField("other_fee_label", otherFeeDraft.label);
            setField("other_fee", otherFeeDraft.amount);
            setShowOtherFeeModal(false);
          }}
        />
      )}

      {confirmAction && (
        <ActionConfirmModal
          title={
            confirmAction === "cancel"
              ? "Bạn có chắc muốn hủy phiếu này?"
              : confirmAction === "draft"
                ? "Bạn có chắc muốn lưu nháp phiếu này?"
                : mode === "edit"
                  ? "Bạn có chắc muốn cập nhật phiếu này?"
                  : "Bạn có chắc muốn thêm phiếu này?"
          }
          message={
            confirmAction === "cancel"
              ? "Lưu ý: Phiếu sau khi hủy sẽ không được lưu thay đổi hiện tại."
              : confirmAction === "draft"
                ? "Phiếu sẽ được lưu ở trạng thái nháp và có thể chỉnh sửa tiếp."
                : "Phiếu sau khi lưu sẽ được ghi nhận vào danh sách phiếu đặt hàng."
          }
          note={
            confirmAction === "cancel"
              ? "Bạn có thể quay lại để tiếp tục chỉnh sửa."
              : "Vui lòng kiểm tra lại thông tin trước khi tiếp tục."
          }
          confirmLabel="Tiếp tục"
          cancelLabel="Không, quay lại"
          loading={saving}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction === "cancel") {
              setConfirmAction(null);
              onCancel?.();
              return;
            }
            const action = confirmAction;
            setConfirmAction(null);
            saveOrder(action === "draft" ? "draft" : "waiting");
          }}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message={
            mode === "edit"
              ? "Cập nhật phiếu đặt hàng thành công!"
              : "Tạo phiếu đặt hàng thành công!"
          }
          onClose={() => {
            setShowSuccess(false);
            if (pendingSavedOrder) {
              onSaved?.(pendingSavedOrder);
            }
          }}
        />
      )}
    </div>
  );
}

function SimpleValueModal({
  title,
  value,
  suffix,
  onChange,
  onReset,
  onClose,
  onSave,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#13162D]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={22} />
          </button>
        </div>
        <div className="px-5 py-5">
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-700">
              {suffix}
            </span>
          </div>
        </div>
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-300 hover:text-gray-500 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#F58220" }}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OtherFeeModal({ value, onChange, onReset, onClose, onSave }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#13162D]">Chi phí khác</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={22} />
          </button>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 gap-4">
          <input
            type="text"
            value={value.label}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, label: e.target.value }))
            }
            placeholder="Nhập nội dung"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={value.amount}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-700">
              đ
            </span>
          </div>
        </div>
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-300 hover:text-gray-500 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#F58220" }}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialAvatar({ material, size = "md" }) {
  const image = material?.image || "";
  const label = String(material?.name || "NVL").trim();
  const initial = label.charAt(0).toUpperCase() || "N";
  const sizeClass =
    size === "lg" ? "w-14 h-14 rounded-xl" : "w-10 h-10 rounded-lg";

  if (image) {
    return (
      <img
        src={image}
        alt={label}
        className={`${sizeClass} object-cover border border-gray-200 bg-white flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} border border-gray-200 bg-orange-50 text-orange-500 flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initial}
    </div>
  );
}
