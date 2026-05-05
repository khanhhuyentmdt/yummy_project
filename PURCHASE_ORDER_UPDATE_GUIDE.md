# Hướng dẫn cập nhật module Phiếu đặt hàng

## ✅ Backend đã hoàn tất

### 1. File: `backend/api/views/san_xuat/nguyen_vat_lieu/purchase_views.py`
- ✅ Thêm logic phân quyền: chỉ cho edit/delete khi status = 'draft'
- ✅ Thêm endpoint `purchase_order_cancel` để hủy phiếu
- ✅ Kiểm tra thời gian 24h khi hủy phiếu

### 2. File: `backend/api/urls.py`
- ✅ Thêm route `/api/purchase-orders/<int:pk>/cancel/`

## 📝 Cần cập nhật Frontend

### 1. File: `PurchaseOrdersPage.jsx` - Trang danh sách

**Cần thay đổi:**

```jsx
// Thêm helper function kiểm tra thời gian
const canCancelOrder = (order) => {
  if (order.status === 'draft' || order.status === 'cancelled') return false;
  const createdAt = new Date(order.created_at);
  const now = new Date();
  const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
  return hoursDiff < 24;
};

// Trong phần render checkbox - CHỈ hiện checkbox cho status = 'draft'
<td className="px-5 py-3.5">
  {order.status === 'draft' ? (
    <input
      type="checkbox"
      checked={selected.has(order.id)}
      onChange={() => toggleOne(order.id)}
      className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-orange-500"
    />
  ) : (
    <div className="w-4 h-4" /> // Ô trống
  )}
</td>

// Trong dropdown actions
{openDropdownId === order.id && (
  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
    {order.status === 'draft' ? (
      <>
        <button onClick={() => { setOpenDropdownId(null); onEditClick?.(order.id); }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Chỉnh sửa
        </button>
        <button onClick={() => { setDeleteTarget(order); setOpenDropdownId(null); }}
          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
          Xóa
        </button>
      </>
    ) : (
      <button onClick={() => { setOpenDropdownId(null); onViewClick?.(order.id); }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        Xem
      </button>
    )}
    
    {canCancelOrder(order) && (
      <button onClick={() => { setCancelTarget(order); setOpenDropdownId(null); }}
        className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50">
        Hủy phiếu
      </button>
    )}
  </div>
)}

// Thêm state và modal hủy phiếu
const [cancelTarget, setCancelTarget] = useState(null);
const [cancelLoading, setCancelLoading] = useState(false);

const handleCancelConfirm = async () => {
  if (!cancelTarget) return;
  setCancelLoading(true);
  try {
    await api.post(`purchase-orders/${cancelTarget.id}/cancel/`);
    loadOrders(); // Reload danh sách
    setCancelTarget(null);
    setSuccessMessage("Hủy phiếu đặt hàng thành công!");
  } catch (error) {
    const msg = error.response?.data?.detail || "Không thể hủy phiếu đặt hàng.";
    setSuccessMessage(msg); // Hoặc dùng error modal
  } finally {
    setCancelLoading(false);
  }
};

// Modal hủy phiếu với icon warning vàng
{cancelTarget && (
  <ActionConfirmModal
    title="Bạn có chắc muốn hủy phiếu này?"
    message={`Phiếu ${cancelTarget.code} sẽ chuyển sang trạng thái Đã hủy.`}
    note="Hành động này không thể hoàn tác."
    confirmLabel={cancelLoading ? "Đang hủy..." : "Vâng, hủy phiếu"}
    cancelLabel="Không, quay lại"
    loading={cancelLoading}
    onConfirm={handleCancelConfirm}
    onClose={() => setCancelTarget(null)}
    icon="warning" // Icon dấu chấm than vàng
  />
)}
```

### 2. File: `PurchaseOrderFormPage.jsx` - Trang chỉnh sửa/xem

**Cần thay đổi:**

```jsx
// Thêm prop isReadOnly
const isReadOnly = mode === 'edit' && form.status !== 'draft';

// Disable tất cả input khi isReadOnly = true
<input
  type="text"
  value={form.responsible_name}
  onChange={(e) => setField("responsible_name", e.target.value)}
  disabled={isReadOnly}
  className={`w-full px-3 py-2.5 text-sm border rounded-lg ${
    isReadOnly 
      ? "bg-gray-100 text-gray-600 cursor-not-allowed" 
      : "bg-gray-50 focus:ring-2 focus:ring-orange-300"
  }`}
/>

// Disable select
<select
  value={form.supplier}
  onChange={(e) => setField("supplier", e.target.value)}
  disabled={isReadOnly}
  className={`w-full px-3 py-2.5 text-sm border rounded-lg ${
    isReadOnly 
      ? "bg-gray-100 text-gray-600 cursor-not-allowed" 
      : "bg-gray-50 focus:ring-2 focus:ring-orange-300"
  }`}
>
  {/* options */}
</select>

// Ẩn nút "Thêm nguyên vật liệu" khi readonly
{!isReadOnly && (
  <div className="relative mb-4" ref={materialSearchRef}>
    {/* Search input */}
  </div>
)}

// Ẩn nút xóa item khi readonly
{!isReadOnly && (
  <button type="button" onClick={() => removeItem(item.id)}>
    <Trash2 size={15} />
  </button>
)}

// Disable input số lượng, đơn giá
<input
  type="number"
  value={item.quantity}
  onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
  disabled={isReadOnly}
  className={`w-full rounded-xl border px-4 py-3 ${
    isReadOnly 
      ? "bg-gray-100 text-gray-600 cursor-not-allowed" 
      : "bg-gray-50 focus:ring-2 focus:ring-orange-300"
  }`}
/>

// Ẩn nút Lưu/Cập nhật khi readonly
{!isReadOnly && (
  <button type="button" onClick={() => requestSave("waiting")}>
    {saving ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Thêm"}
  </button>
)}

// Đổi title khi readonly
<h1 className="text-2xl font-bold text-gray-800 tracking-wide">
  {isReadOnly 
    ? "XEM PHIẾU ĐẶT HÀNG" 
    : mode === "edit" 
      ? "CHỈNH SỬA PHIẾU ĐẶT HÀNG" 
      : "THÊM MỚI PHIẾU ĐẶT HÀNG"
  }
</h1>
```

### 3. Cập nhật ActionConfirmModal để hỗ trợ icon warning

```jsx
// File: ActionConfirmModal.jsx
export default function ActionConfirmModal({
  title,
  message,
  note,
  confirmLabel,
  cancelLabel,
  loading,
  onConfirm,
  onClose,
  icon = "default", // "default" | "warning"
}) {
  const iconConfig = {
    default: {
      bg: "bg-orange-50",
      icon: <AlertTriangle size={18} className="text-orange-500" />
    },
    warning: {
      bg: "bg-yellow-50",
      icon: <AlertTriangle size={18} className="text-yellow-500" />
    }
  };
  
  const config = iconConfig[icon] || iconConfig.default;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
            {config.icon}
          </div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
        </div>
        {/* Rest of modal */}
      </div>
    </div>
  );
}
```

## 🎯 Checklist hoàn thành

### Backend
- [x] Thêm logic phân quyền edit/delete theo status
- [x] Thêm endpoint cancel với kiểm tra 24h
- [x] Cập nhật URLs

### Frontend - PurchaseOrdersPage
- [ ] Chỉ hiện checkbox cho dòng status = 'draft'
- [ ] Dropdown actions: 'Chỉnh sửa'/'Xóa' cho draft, 'Xem' cho khác
- [ ] Thêm option 'Hủy phiếu' nếu < 24h và không phải draft/cancelled
- [ ] Thêm modal xác nhận hủy với icon warning vàng
- [ ] Implement handleCancelConfirm

### Frontend - PurchaseOrderFormPage
- [ ] Thêm logic isReadOnly = (mode === 'edit' && status !== 'draft')
- [ ] Disable tất cả input/select/datepicker khi isReadOnly
- [ ] Ẩn nút "Thêm nguyên vật liệu" khi isReadOnly
- [ ] Ẩn nút xóa item khi isReadOnly
- [ ] Ẩn nút Lưu/Cập nhật khi isReadOnly
- [ ] Đổi title thành "XEM PHIẾU ĐẶT HÀNG" khi isReadOnly

### Styling
- [ ] Font Nunito Sans
- [ ] Tiêu đề bảng IN HOA
- [ ] Icon warning vàng cho modal hủy phiếu
- [ ] Tiếng Việt có dấu 100%

## 📌 Lưu ý quan trọng

1. **Phân quyền Backend**: API đã chặn edit/delete nếu không phải draft
2. **Thời gian 24h**: Tính từ `created_at`, không phải `updated_at`
3. **Status cancelled**: Một khi đã hủy, không thể edit/delete/cancel nữa
4. **Checkbox**: Chỉ hiện cho draft, các dòng khác để ô trống (không ẩn cột)
5. **Read-only mode**: Tất cả field phải disabled, không chỉ ẩn nút Save

## 🔄 Áp dụng tương tự cho Phiếu nhập kho

Sau khi hoàn thành Phiếu đặt hàng, áp dụng logic tương tự cho:
- `WarehouseReceiptPage.jsx`
- `WarehouseReceiptFormPage.jsx`  
- `warehouse_receipt_views.py`
- Thêm endpoint `/api/warehouse-receipts/<int:pk>/cancel/`
