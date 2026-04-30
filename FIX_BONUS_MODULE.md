# Sửa lỗi Module Quản lý Thưởng

## Vấn đề
1. **Trang danh sách**: Hiển thị sai cột (vẫn dùng single employee thay vì employee_count)
2. **Bấm "Thêm" không được**: Có thể do lỗi validation hoặc API

## Các thay đổi đã thực hiện

### 1. Backend Views (`backend/api/views/nhan_su/quan_ly_luong/bonus_views.py`)

**Đã sửa:**
- ✅ Đổi `.select_related('employee')` → `.prefetch_related('employees')` (vì M2M)
- ✅ Đổi filter `employee__full_name` → `employees__full_name` + `.distinct()`
- ✅ Đổi filter `employee_id` → `employees__id`
- ✅ Đổi status filter: `'active', 'inactive'` → `'pending', 'paid', 'cancelled'`
- ✅ Đổi ordering: `'amount'` → `'total_amount'`

### 2. Frontend BonusListPage (`frontend/src/components/nhan-su/quan-ly-luong/thuong/BonusListPage.jsx`)

**Đã sửa:**
- ✅ Đổi STATUS_LABEL: `active/inactive` → `paid/cancelled`
- ✅ Đổi cột table: `NHÂN VIÊN` → `SỐ LƯỢNG NV ĐƯỢC THƯỞNG`
- ✅ Đổi hiển thị: `employee_name/employee_code` → `employee_count`
- ✅ Đổi hiển thị: `amount` → `total_amount`
- ✅ Đổi nút "Hành động" → "Chỉnh sửa" (đơn giản hơn)
- ✅ Xóa import `ChevronDown` không dùng
- ✅ Cập nhật export CSV với cột mới
- ✅ Cập nhật filter dropdown với status mới

## Cấu trúc dữ liệu mới

### API Response (GET /api/bonuses/):
```json
{
  "bonuses": [
    {
      "id": 1,
      "code": "MTH001",
      "reason": "Thưởng tết",
      "bonus_date": "2026-01-15",
      "recipient_type": "selected",
      "bonus_type": "direct",
      "amount_per_person": "5000000",
      "employee_count": 3,
      "total_amount": "15000000",
      "employees_list": [
        {
          "id": 1,
          "code": "MNV001",
          "full_name": "Nguyễn Văn A",
          "role": "Nhân viên"
        },
        ...
      ],
      "notes": "",
      "status": "pending",
      "created_by_name": "Admin",
      "created_at": "2026-01-10T10:00:00Z",
      "updated_at": "2026-01-10T10:00:00Z",
      "history": []
    }
  ],
  "total": 1
}
```

### API Request (POST /api/bonuses/):
```json
{
  "reason": "Thưởng tết",
  "bonus_date": "2026-01-15",
  "amount_per_person": "5000000",
  "recipient_type": "selected",
  "bonus_type": "direct",
  "employee_ids": [1, 5, 8],
  "notes": "Ghi chú..."
}
```

## Hướng dẫn test

### 1. Khởi động server

**Backend:**
```bash
cd backend
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Test trang danh sách

1. Truy cập: http://localhost:2347/nhan-su/quan-ly-luong/thuong
2. Kiểm tra các cột:
   - ✅ MÃ THƯỞNG
   - ✅ LÝ DO THƯỞNG
   - ✅ SỐ LƯỢNG NV ĐƯỢC THƯỞNG (hiển thị số + "nhân viên")
   - ✅ TỔNG TIỀN (format VND với màu cam)
   - ✅ NGÀY THƯỞNG
   - ✅ TRẠNG THÁI (Chưa thanh toán/Đã thanh toán/Đã hủy)
   - ✅ HÀNH ĐỘNG (nút "Chỉnh sửa")

3. Test các tính năng:
   - ✅ Tìm kiếm
   - ✅ Bộ lọc (Tất cả/Chưa thanh toán/Đã thanh toán/Đã hủy)
   - ✅ Xuất CSV
   - ✅ Pagination

### 3. Test trang thêm mới

1. Bấm nút "Thêm thưởng"
2. Điền form:
   - Lý do thưởng: "Thưởng tết 2026"
   - Ngày thưởng: Chọn ngày
   - Mức thưởng từng: 5000000 (sẽ format thành 5,000,000)
   - Nhân viên được thưởng: Chọn "Tùy chọn"
   - Tìm và chọn 2-3 nhân viên
   - Hình thức thưởng: "Thưởng trực tiếp"
   - Ghi chú: (tùy chọn)

3. Bấm "Thêm"
4. Kiểm tra:
   - ✅ Success modal hiển thị: "Thêm thưởng thành công!"
   - ✅ Chuyển sang trang Edit của bonus vừa tạo
   - ✅ Dữ liệu hiển thị đúng

### 4. Test trang chỉnh sửa

1. Từ danh sách, bấm "Chỉnh sửa" một bonus
2. Kiểm tra:
   - ✅ Form hiển thị đầy đủ thông tin
   - ✅ Danh sách nhân viên đã chọn hiển thị
   - ✅ Có thể thêm/xóa nhân viên
   - ✅ Số lượng NV và Tổng tiền tự động tính
   - ✅ Có thể đổi trạng thái
   - ✅ Lịch sử thay đổi hiển thị (nếu có)

3. Thay đổi thông tin và bấm "Lưu"
4. Kiểm tra:
   - ✅ Success modal: "Cập nhật thưởng thành công!"
   - ✅ Lịch sử thay đổi được cập nhật

### 5. Test validation

**Trang thêm/sửa:**
- ✅ Lý do thưởng: Bắt buộc
- ✅ Ngày thưởng: Bắt buộc
- ✅ Mức thưởng từng: Bắt buộc, phải > 0
- ✅ Nhân viên: Nếu chọn "Tùy chọn", phải chọn ít nhất 1 nhân viên

### 6. Test edge cases

1. **Thưởng tất cả nhân viên:**
   - Chọn "Tất cả nhân viên"
   - Không cần chọn nhân viên cụ thể
   - Backend tự động lấy tất cả nhân viên đang làm việc

2. **Thay đổi từ "Tùy chọn" sang "Tất cả":**
   - Danh sách nhân viên đã chọn sẽ bị xóa
   - employee_ids = []

3. **Format tiền:**
   - Input: 5000000
   - Display: 5,000,000 đ

## Debug nếu có lỗi

### Lỗi khi bấm "Thêm"

1. **Mở Console (F12):**
   - Tab Console: Xem lỗi JavaScript
   - Tab Network: Xem request/response API

2. **Kiểm tra request payload:**
   ```json
   {
     "reason": "...",
     "bonus_date": "2026-01-15",
     "amount_per_person": "5000000",
     "recipient_type": "selected",
     "bonus_type": "direct",
     "employee_ids": [1, 2, 3],
     "notes": ""
   }
   ```

3. **Kiểm tra response:**
   - Status 201: Thành công
   - Status 400: Validation error (xem response body)
   - Status 500: Server error (xem Django console)

### Lỗi validation phổ biến

1. **"employee_ids": ["A valid integer is required."]**
   - Nguyên nhân: employee_ids không phải array
   - Đã fix: Backend parse JSON string thành array

2. **"Vui lòng chọn ít nhất 1 nhân viên."**
   - Nguyên nhân: recipient_type='selected' nhưng employee_ids rỗng
   - Giải pháp: Chọn ít nhất 1 nhân viên hoặc đổi sang "Tất cả"

3. **"Vui lòng nhập mức thưởng hợp lệ."**
   - Nguyên nhân: amount_per_person = 0 hoặc rỗng
   - Giải pháp: Nhập số tiền > 0

## Files đã thay đổi

### Backend:
- ✅ `backend/api/views/nhan_su/quan_ly_luong/bonus_views.py`

### Frontend:
- ✅ `frontend/src/components/nhan-su/quan-ly-luong/thuong/BonusListPage.jsx`
- ✅ `frontend/src/components/nhan-su/quan-ly-luong/thuong/CreateBonusPage.jsx` (đã hoàn thành trước)
- ✅ `frontend/src/components/nhan-su/quan-ly-luong/thuong/EditBonusPage.jsx` (đã hoàn thành trước)

## Checklist hoàn thành

- [x] Backend views cập nhật cho M2M relationship
- [x] BonusListPage hiển thị đúng cột mới
- [x] Status labels cập nhật (pending/paid/cancelled)
- [x] CreateBonusPage hỗ trợ multi-employee
- [x] EditBonusPage hỗ trợ multi-employee
- [x] Validation đầy đủ
- [x] Export CSV với cột mới
- [x] Filter dropdown với status mới
- [ ] **TEST thực tế trên browser** ← CẦN LÀM

## Ghi chú

- Tất cả code đã được cập nhật
- Cần chạy server và test trên browser để đảm bảo không có lỗi runtime
- Nếu có lỗi, check Console (F12) và Django terminal
