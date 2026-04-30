# Sửa lỗi thêm hồ sơ nhân viên - Tóm tắt

## Vấn đề
Người dùng không thể thêm hồ sơ nhân viên mới. Request không được gửi đến backend.

## Các thay đổi đã thực hiện

### 1. Frontend - CreateEmployeePage.jsx
**File**: `frontend/src/components/nhan-su/thiet-lap-nhan-vien/ho-so-nhan-vien/CreateEmployeePage.jsx`

**Thay đổi trong hàm `handleSave`**:
- ✅ Thêm console.log để debug validation errors
- ✅ Xử lý đúng `salary_amount` và `salary_type_id` khi rỗng (skip thay vì gửi giá trị rỗng)
- ✅ Thêm console.log để theo dõi quá trình gửi request
- ✅ Thêm console.error chi tiết khi có lỗi từ backend

**Logic gửi dữ liệu**:
```javascript
// benefits_ids: Gửi dưới dạng JSON string
fd.append('benefits_ids', JSON.stringify(Array.isArray(v) ? v : []))

// has_salary_info: Gửi dưới dạng string 'true' hoặc 'false'
fd.append('has_salary_info', v ? 'true' : 'false')

// salary_amount và salary_type_id: Skip nếu rỗng
if (k === 'salary_amount' && v === '') return
if (k === 'salary_type_id' && v === '') return
```

### 2. Backend - EmployeeWriteSerializer
**File**: `backend/api/serializers/nhan_su/thiet_lap_nhan_vien/__init__.py`

**Thay đổi**:
- ✅ Thêm `allow_null=True` cho `has_salary_info`, `salary_amount`
- ✅ Thêm `allow_empty=True` cho `benefits_ids`
- ✅ Thêm method `to_internal_value()` để convert string 'true'/'false' thành boolean

**Code mới**:
```python
def to_internal_value(self, data):
    """Override to handle string 'true'/'false' for has_salary_info"""
    # Convert string 'true'/'false' to boolean
    if 'has_salary_info' in data:
        val = data['has_salary_info']
        if isinstance(val, str):
            data = data.copy()
            data['has_salary_info'] = val.lower() in ('true', '1', 'yes')
    
    return super().to_internal_value(data)
```

## Cách kiểm tra

### Bước 1: Mở Browser Console
1. Mở trang Hồ sơ nhân viên
2. Nhấn F12 để mở Developer Tools
3. Chuyển sang tab Console

### Bước 2: Thử thêm nhân viên mới
1. Nhấn nút "Thêm mới"
2. Điền các thông tin bắt buộc:
   - ✅ Họ và tên nhân viên
   - ✅ Số điện thoại
   - ✅ Vai trò
   - ✅ Ca làm việc

### Bước 3: Kiểm tra Console
**Nếu có lỗi validation**:
```
Validation errors: { role: "Vui lòng chọn vai trò." }
```

**Nếu gửi request thành công**:
```
Sending employee data...
Employee created successfully: { id: 1, code: "MNV001", ... }
```

**Nếu có lỗi từ backend**:
```
Error creating employee: ...
Error response: { phone: ["So dien thoai nay da duoc su dung."] }
```

### Bước 4: Kiểm tra Network Tab
1. Chuyển sang tab Network trong Developer Tools
2. Thử thêm nhân viên
3. Tìm request POST đến `/api/employees/`
4. Kiểm tra:
   - Status Code: 201 (thành công) hoặc 400 (lỗi validation)
   - Response: Dữ liệu nhân viên mới hoặc lỗi chi tiết

## Các trường hợp test

### Test Case 1: Thêm nhân viên cơ bản (không có lương thưởng)
**Input**:
- Họ và tên: "Nguyễn Văn A"
- Số điện thoại: "0901234567"
- Vai trò: "Nhân viên bếp"
- Ca làm việc: "Ca sáng"

**Expected**: Tạo thành công với mã MNV001, MNV002, ...

### Test Case 2: Thêm nhân viên có lương thưởng
**Input**:
- Thông tin cơ bản như Test Case 1
- ✅ Tích checkbox "Lương thưởng"
- Loại lương: Chọn một loại
- Mức lương: 10000000
- Phúc lợi: Thêm 1-2 chính sách

**Expected**: Tạo thành công với đầy đủ thông tin lương thưởng

### Test Case 3: Thêm nhân viên có địa chỉ đầy đủ
**Input**:
- Thông tin cơ bản như Test Case 1
- Tỉnh/Thành phố: Chọn một tỉnh
- Quận/Huyện: Chọn một quận (sau khi chọn tỉnh)
- Phường/Xã: Chọn một phường (sau khi chọn quận)

**Expected**: Tạo thành công với địa chỉ đầy đủ

### Test Case 4: Validation errors
**Input**:
- Bỏ trống "Họ và tên"
- Nhấn "Thêm"

**Expected**: Hiện lỗi "Vui lòng nhập họ và tên."

### Test Case 5: Số điện thoại trùng
**Input**:
- Nhập số điện thoại đã tồn tại
- Nhấn "Thêm"

**Expected**: Hiện lỗi "So dien thoai nay da duoc su dung."

## Backend Status
✅ Backend đang chạy tại http://127.0.0.1:2344/
✅ Đã tự động reload với thay đổi mới

## Các API endpoints liên quan
- `POST /api/employees/` - Tạo nhân viên mới
- `GET /api/provinces/` - Lấy danh sách tỉnh
- `GET /api/districts/?province_code=XX` - Lấy danh sách quận theo tỉnh
- `GET /api/wards/?district_code=XX` - Lấy danh sách phường theo quận
- `GET /api/salary-types/` - Lấy danh sách loại lương
- `GET /api/benefits-policies/` - Lấy danh sách chính sách phúc lợi

## Lưu ý
1. **Console logs**: Đã thêm nhiều console.log để dễ debug
2. **Error handling**: Đã cải thiện xử lý lỗi từ backend
3. **Data format**: Đảm bảo dữ liệu gửi đi đúng format mà backend mong đợi
4. **Boolean conversion**: Backend tự động convert string 'true'/'false' thành boolean

## Nếu vẫn gặp lỗi
1. Kiểm tra Console browser để xem lỗi cụ thể
2. Kiểm tra Network tab để xem request có được gửi không
3. Kiểm tra backend logs (terminal đang chạy Django)
4. Gửi screenshot lỗi để được hỗ trợ thêm
