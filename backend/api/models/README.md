# 📁 Cấu trúc Models - ERP Yummy

## 🎯 Mục đích
Tổ chức models theo module nghiệp vụ để dễ quản lý và maintain khi dự án phát triển.

---

## 📂 Cấu trúc thư mục

```
backend/api/models/
├── __init__.py                    # Import và export tất cả models
├── auth/                          # Module xác thực
│   ├── __init__.py
│   └── user.py                    # User, UserManager
├── san_xuat/                      # Module sản xuất
│   ├── __init__.py
│   ├── product.py                 # Product
│   ├── raw_material.py            # RawMaterial
│   └── product_bom.py             # ProductBOM (Bill of Materials)
├── ban_hang/                      # Module bán hàng
│   ├── __init__.py
│   ├── customer.py                # Customer
│   └── order.py                   # Order
├── mua_hang/                      # Module mua hàng
│   ├── __init__.py
│   ├── material.py                # Material (Nguyên vật liệu)
│   ├── supplier.py                # Supplier (Nhà cung cấp)
│   └── purchase_order.py          # PurchaseOrder (Phiếu mua hàng)
└── cai_dat/                       # Module cài đặt
    ├── __init__.py
    ├── location.py                # Location, LocationHistory
    └── shipping_unit.py           # ShippingUnit, ShippingUnitHistory
```

---

## 📋 Danh sách Models

### 🔐 Auth (`auth/`)
- **User** - Người dùng hệ thống (custom user với phone_number)
- **UserManager** - Manager cho User model

### 🏭 Sản xuất (`san_xuat/`)
- **Product** - Sản phẩm
- **RawMaterial** - Nguyên liệu thô
- **ProductBOM** - Định mức nguyên liệu cho sản phẩm

### 🛒 Bán hàng (`ban_hang/`)
- **Customer** - Khách hàng
- **Order** - Đơn hàng

### 📦 Mua hàng (`mua_hang/`)
- **Material** - Nguyên vật liệu
- **Supplier** - Nhà cung cấp
- **PurchaseOrder** - Phiếu mua hàng

### ⚙️ Cài đặt (`cai_dat/`)
- **Location** - Địa điểm (chi nhánh, kho, cửa hàng)
- **LocationHistory** - Lịch sử thay đổi địa điểm
- **ShippingUnit** - Đối tác vận chuyển
- **ShippingUnitHistory** - Lịch sử thay đổi đối tác vận chuyển

---

## 🔧 Cách sử dụng

### Import models trong code:

```python
# Cách 1: Import trực tiếp từ api.models
from api.models import User, Product, Customer, Location

# Cách 2: Import từ module cụ thể
from api.models.auth import User
from api.models.san_xuat import Product, RawMaterial
from api.models.ban_hang import Customer, Order
from api.models.mua_hang import Material, Supplier
from api.models.cai_dat import Location, ShippingUnit
```

### Trong serializers.py:
```python
from api.models import Product, Customer, Order
# hoặc
from api.models.san_xuat import Product
from api.models.ban_hang import Customer, Order
```

### Trong views:
```python
from api.models import User, Product, Location
# hoặc
from api.models.auth import User
from api.models.san_xuat import Product
from api.models.cai_dat import Location
```

---

## ✅ Lợi ích của cấu trúc mới

1. **Dễ tìm kiếm**: Models được nhóm theo module nghiệp vụ
2. **Dễ maintain**: Mỗi file chỉ chứa 1-2 models liên quan
3. **Scalable**: Dễ dàng thêm models mới vào module tương ứng
4. **Rõ ràng**: Cấu trúc phản ánh đúng nghiệp vụ của hệ thống
5. **Tương đồng với Views**: Cấu trúc giống với `api/views/`

---

## 📝 Quy tắc khi thêm model mới

1. **Xác định module nghiệp vụ**: Model thuộc module nào? (auth, san_xuat, ban_hang, mua_hang, cai_dat)
2. **Tạo file mới**: Tạo file `.py` trong folder tương ứng
3. **Export trong `__init__.py`**: Thêm import vào file `__init__.py` của module
4. **Export trong `models/__init__.py`**: Thêm vào file `__init__.py` chính
5. **Tạo migration**: Chạy `python manage.py makemigrations`

### Ví dụ: Thêm model ProductGroup vào module sản xuất

```python
# 1. Tạo file: backend/api/models/san_xuat/product_group.py
from django.db import models

class ProductGroup(models.Model):
    name = models.CharField(max_length=100)
    # ... các fields khác

# 2. Cập nhật: backend/api/models/san_xuat/__init__.py
from .product import Product
from .raw_material import RawMaterial
from .product_bom import ProductBOM
from .product_group import ProductGroup  # ← Thêm dòng này

__all__ = ['Product', 'RawMaterial', 'ProductBOM', 'ProductGroup']

# 3. Cập nhật: backend/api/models/__init__.py
from .san_xuat import Product, RawMaterial, ProductBOM, ProductGroup  # ← Thêm ProductGroup

__all__ = [
    # ...
    'ProductGroup',  # ← Thêm vào __all__
]

# 4. Tạo migration
# python manage.py makemigrations
# python manage.py migrate
```

---

## 🔄 Migration từ cấu trúc cũ

**File cũ**: `backend/api/models.py` (1 file chứa tất cả models)

**File mới**: `backend/api/models/` (folder với nhiều file con)

**Backup**: File cũ đã được backup tại `backend/api/models_old.py`

**Tương thích ngược**: ✅ 100% tương thích
- Tất cả imports cũ vẫn hoạt động bình thường
- Không cần thay đổi code hiện có
- Không cần tạo migration mới

---

## 🧪 Testing

Sau khi refactor, đã test:
- ✅ `python manage.py check` - Không có lỗi
- ✅ `python manage.py makemigrations --dry-run` - Không có thay đổi
- ✅ `python manage.py runserver` - Server chạy thành công
- ✅ Import models trong serializers - Hoạt động bình thường
- ✅ Import models trong views - Hoạt động bình thường

---

## 📚 Tham khảo

- Django Best Practices: https://docs.djangoproject.com/en/stable/topics/db/models/
- Code Organization: https://learndjango.com/tutorials/django-best-practices-projects-vs-apps
