# CHANGELOG - Module Đối Tác Vận Chuyển

## Cập nhật ngày: 29/04/2026

### 🎯 Mục đích
Điều chỉnh module "Đơn vị vận chuyển" thành "Đối tác vận chuyển" theo đúng thiết kế trong screenshot.

---

## 📋 Thay đổi Backend

### 1. **Model: ShippingUnit** (`backend/api/models.py`)
**Các trường đã thêm:**
- `email` - Email đối tác
- `address` - Địa chỉ
- `city` - Tỉnh/Thành phố
- `district` - Quận/Huyện
- `ward` - Phường/Xã
- `notes` - Ghi chú

**Các trường đã sửa:**
- `code`: Verbose name đổi từ "Ma don vi" → "Ma doi tac"
- `name`: Verbose name đổi từ "Ten don vi van chuyen" → "Ten doi tac"
- `status`: Choice text đổi từ "Tam ngung" → "Ngung hoat dong"

### 2. **Serializer** (`backend/api/serializers.py`)
- Cập nhật `ShippingUnitSerializer` để bao gồm các trường mới
- Cập nhật `ShippingUnitWriteSerializer`:
  - Thêm validation cho các trường mới
  - Đổi format mã từ `MDVC{id:06d}` → `MDT{id:04d}` (Mã Đối Tác)
  - Cập nhật error message từ "đơn vị vận chuyển" → "đối tác"

### 3. **Migration**
- File: `backend/api/migrations/0016_shippingunit_address_shippingunit_city_and_more.py`
- Đã chạy thành công: ✅

---

## 🎨 Thay đổi Frontend

### 1. **ShippingUnitsPage.jsx** - Trang danh sách

**Header:**
- Tiêu đề: "DANH SÁCH ĐƠN VỊ VẬN CHUYỂN" → "ĐỐI TÁC VẬN CHUYỂN"
- Breadcrumb: "Danh sách đơn vị vận chuyển" → "Đối tác vận chuyển"
- Nút góc phải: Thay "Nhập/Xuất" → "Đối tác tích hợp" + "Đối tác tư liên hệ" (cam)

**Bảng danh sách:**
- Cột: Thêm cột "TỈNH/THÀNH PHỐ" giữa "SỐ ĐIỆN THOẠI" và "TRẠNG THÁI"
- Header cột: 
  - "MÃ ĐƠN VỊ" → "MÃ ĐỐI TÁC"
  - "TÊN ĐƠN VỊ VẬN CHUYỂN" → "TÊN ĐỐI TÁC"
- Bỏ icon Truck trong cột tên
- Trạng thái: "Tạm ngưng" → "Ngưng hoạt động"

**Nút action:**
- "Thêm đơn vị vận chuyển" → "Thêm đối tác"

**Search & Filter:**
- Placeholder: "Tìm kiếm đơn vị vận chuyển" → "Tìm kiếm đối tác vận chuyển"
- Thêm tìm kiếm theo `city`

**Fallback data:**
- Đổi từ tên công ty vận chuyển → Tên người (theo screenshot)
- Mã: MDVC001 → MDT001, MDT002, MDT003, MDT004

### 2. **AddShippingUnitModal.jsx** - Popup thêm mới

**Header:**
- "Thêm đơn vị vận chuyển" → "THÊM MỚI ĐỐI TÁC TƯ LIÊN HỆ"

**Form fields (2 cột):**
1. **Tên đối tác*** (full width)
2. **Số điện thoại*** | **Email**
3. **Địa chỉ*** | **Tỉnh/Thành phố*** (dropdown)
4. **Quận/Huyện** (dropdown) | **Phường/Xã** (dropdown)
5. **Ghi chú** (textarea, full width)

**Bỏ trường:**
- ❌ Trạng thái (mặc định là 'active' khi tạo mới)

**Validation:**
- Bắt buộc: Tên đối tác, Số điện thoại, Địa chỉ, Tỉnh/Thành phố

### 3. **EditShippingUnitModal.jsx** - Popup chỉnh sửa

**Header:**
- "Chỉnh sửa đơn vị vận chuyển" → "CHỈNH SỬA ĐỐI TÁC TƯ LIÊN HỆ"

**Form fields (2 cột):**
1. **Mã đối tác** (readonly, full width)
2. **Tên đối tác*** (full width)
3. **Số điện thoại*** | **Email**
4. **Địa chỉ*** | **Tỉnh/Thành phố*** (dropdown)
5. **Quận/Huyện** (dropdown) | **Phường/Xã** (dropdown)
6. **Ghi chú** (textarea, full width)
7. **Trạng thái** (full width) - Có trong Edit modal

**Success message:**
- "Cập nhật đơn vị vận chuyển thành công!" → "Cập nhật đối tác vận chuyển thành công!"

### 4. **DeleteShippingUnitModal.jsx**

**Message:**
- "đơn vị vận chuyển" → "đối tác vận chuyển"

### 5. **sidebarConfig.js**

**Menu item:**
- Label: "Thiết lập đơn vị vận chuyển" → "Đối tác vận chuyển"

---

## ✅ Checklist hoàn thành

### Backend:
- [x] Cập nhật Model với các trường mới
- [x] Cập nhật Serializer
- [x] Tạo và chạy migration
- [x] Cập nhật format mã đối tác (MDT)
- [x] Backend server đang chạy tại port 2344

### Frontend:
- [x] Cập nhật ShippingUnitsPage (danh sách)
- [x] Cập nhật AddShippingUnitModal (thêm mới)
- [x] Cập nhật EditShippingUnitModal (chỉnh sửa)
- [x] Cập nhật DeleteShippingUnitModal (xóa)
- [x] Cập nhật sidebarConfig (menu)
- [x] Không có lỗi TypeScript/ESLint
- [x] Frontend server đang chạy tại port 2347

---

## 🎯 So sánh với Screenshot

### ✅ Đã khớp với `ds-vanchuyen.png`:
- Tiêu đề: "ĐỐI TÁC VẬN CHUYỂN"
- Breadcrumb: "Cài đặt / Đối tác vận chuyển"
- Nút góc phải: "Đối tác tích hợp" + "Đối tác tư liên hệ"
- Cột bảng: MÃ ĐỐI TÁC | TÊN ĐỐI TÁC | SỐ ĐIỆN THOẠI | TỈNH/THÀNH PHỐ | TRẠNG THÁI | HÀNH ĐỘNG
- Trạng thái: "Đang hoạt động" (xanh) / "Ngưng hoạt động" (đỏ)

### ✅ Đã khớp với `them-vanchuyen.png`:
- Tiêu đề: "THÊM MỚI ĐỐI TÁC TƯ LIÊN HỆ"
- Layout: 2 cột
- Các trường: Tên đối tác, Số điện thoại, Email, Địa chỉ, Tỉnh/Thành phố, Quận/Huyện, Phường/Xã, Ghi chú
- Không có trường "Trạng thái" trong popup thêm mới

---

## 🚀 Cách test

1. **Mở trình duyệt**: http://localhost:2347/
2. **Vào menu**: Cài đặt → Đối tác vận chuyển
3. **Test thêm mới**: Click "Thêm đối tác" → Điền form → Lưu
4. **Test chỉnh sửa**: Click "Hành động" → Chỉnh sửa → Sửa thông tin → Lưu
5. **Test xóa**: Click "Hành động" → Xóa → Xác nhận
6. **Test bulk delete**: Chọn nhiều checkbox → Click "Xóa đã chọn"

---

## 📝 Notes

- Dropdown Tỉnh/Thành phố, Quận/Huyện, Phường/Xã hiện tại có dữ liệu mẫu
- Cần tích hợp API địa giới hành chính Việt Nam nếu muốn dữ liệu đầy đủ
- Mã đối tác tự động tăng: MDT0001, MDT0002, MDT0003...
- Audit trail (lịch sử thay đổi) vẫn hoạt động bình thường
