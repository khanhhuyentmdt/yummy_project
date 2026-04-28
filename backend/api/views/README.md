# Backend API Views Structure

Cấu trúc views được tổ chức theo đúng menu sidebar của ứng dụng, giúp dễ dàng tìm kiếm và quản lý code.

## 📁 Cấu trúc

```
views/
├── __init__.py                      # Export tất cả views
│
├── auth/                            # Authentication
│   ├── __init__.py
│   └── login_views.py              # PhoneLoginView
│
├── tong_quan/                       # Tổng quan / Dashboard
│   ├── __init__.py
│   └── dashboard_views.py          # dashboard_stats + helper functions
│
├── san_xuat/                        # Sản xuất
│   ├── __init__.py
│   │
│   ├── bep_trung_tam/              # Bếp trung tâm
│   │   ├── __init__.py
│   │   └── product_views.py        # product_list, product_detail, product_sync
│   │
│   └── nguyen_vat_lieu/            # Nguyên vật liệu
│       ├── __init__.py
│       ├── material_views.py       # material_list, material_detail
│       ├── raw_material_views.py   # raw_material_list (for BOM)
│       └── purchase_views.py       # supplier_*, purchase_order_*
│
└── ban_hang/                        # Bán hàng
    ├── __init__.py
    ├── customer_views.py           # customer_list
    └── order_views.py              # order_list
```

## 🎯 Nguyên tắc tổ chức

### 1. **Phân chia theo module nghiệp vụ**
Mỗi folder tương ứng với một module chức năng trong sidebar:
- `auth/`: Xác thực người dùng
- `tong_quan/`: Dashboard và thống kê
- `san_xuat/`: Quản lý sản xuất (sản phẩm, nguyên vật liệu)
- `ban_hang/`: Quản lý bán hàng (khách hàng, đơn hàng)

### 2. **Phân cấp rõ ràng**
- Views được nhóm theo chức năng cụ thể
- Mỗi file views chỉ chứa các function/class liên quan
- Helper functions được đặt cùng file với views sử dụng chúng

### 3. **Import tập trung**
- File `__init__.py` ở mỗi cấp export các views
- File `views/__init__.py` chính export tất cả để dễ import từ `urls.py`

## 📝 Quy ước đặt tên

### File views:
- `{feature}_views.py`: Ví dụ `product_views.py`, `customer_views.py`
- Tên file phản ánh chức năng chính

### Function views:
- `{model}_list`: Danh sách (GET) và tạo mới (POST)
- `{model}_detail`: Chi tiết (GET), cập nhật (PUT/PATCH), xóa (DELETE)
- `{action}_{model}`: Các action đặc biệt, ví dụ `product_sync`

### Class-based views:
- `{Feature}View`: Ví dụ `PhoneLoginView`
- Sử dụng cho các views phức tạp hoặc cần kế thừa

## 🔄 Cách thêm views mới

### Ví dụ: Thêm views cho "Nhân sự > Hồ sơ nhân viên"

1. **Tạo folder structure:**
```bash
mkdir -p backend/api/views/nhan_su
```

2. **Tạo file views:**
```python
# backend/api/views/nhan_su/employee_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def employee_list(request):
    # Implementation
    pass
```

3. **Export trong __init__.py:**
```python
# backend/api/views/nhan_su/__init__.py
from .employee_views import employee_list

__all__ = ['employee_list']
```

4. **Export trong views/__init__.py chính:**
```python
# backend/api/views/__init__.py
from .nhan_su import employee_list

__all__ = [
    # ... existing exports
    'employee_list',
]
```

5. **Thêm URL pattern:**
```python
# backend/api/urls.py
from .views import employee_list

urlpatterns = [
    # ... existing patterns
    path('employees/', employee_list, name='employee-list'),
]
```

## ✅ Lợi ích

1. **Dễ tìm kiếm**: Biết chức năng nằm ở module nào trong sidebar → biết file views tương ứng
2. **Dễ bảo trì**: Mỗi file nhỏ, tập trung vào một chức năng cụ thể
3. **Dễ mở rộng**: Thêm module mới không ảnh hưởng code cũ
4. **Nhất quán**: Cấu trúc backend và frontend đồng nhất
5. **Collaboration**: Nhiều người có thể làm việc song song trên các module khác nhau

## 🚨 Lưu ý

- **Không xóa file `views.py` cũ** cho đến khi đã test kỹ cấu trúc mới
- **Import paths**: Sử dụng `from api.models import ...` thay vì relative imports
- **Permissions**: Đặt permission checks ở đầu mỗi view function
- **Serializers**: Import từ `api.serializers`, không tạo serializers trong views
