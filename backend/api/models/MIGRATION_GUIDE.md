# 🔄 Migration Guide - Models Refactoring

## 📋 Tóm tắt

Đã refactor cấu trúc models từ **1 file lớn** (`models.py`) thành **nhiều file nhỏ** được tổ chức theo module nghiệp vụ.

---

## ✅ Tương thích ngược 100%

**Không cần thay đổi code hiện có!** Tất cả imports cũ vẫn hoạt động bình thường.

### Ví dụ:

```python
# ✅ Cách cũ - VẪN HOẠT ĐỘNG
from api.models import User, Product, Customer

# ✅ Cách mới - CŨNG HOẠT ĐỘNG
from api.models.auth import User
from api.models.san_xuat import Product
from api.models.ban_hang import Customer
```

---

## 📂 Cấu trúc mới

```
backend/api/models/
├── __init__.py                 # Export tất cả models
├── README.md                   # Documentation chi tiết
├── auth/
│   ├── __init__.py
│   └── user.py                 # User, UserManager
├── san_xuat/
│   ├── __init__.py
│   ├── product.py              # Product
│   ├── raw_material.py         # RawMaterial
│   └── product_bom.py          # ProductBOM
├── ban_hang/
│   ├── __init__.py
│   ├── customer.py             # Customer
│   └── order.py                # Order
├── mua_hang/
│   ├── __init__.py
│   ├── material.py             # Material
│   ├── supplier.py             # Supplier
│   └── purchase_order.py       # PurchaseOrder
└── cai_dat/
    ├── __init__.py
    ├── location.py             # Location, LocationHistory
    └── shipping_unit.py        # ShippingUnit, ShippingUnitHistory
```

---

## 🎯 Lợi ích

### 1. **Dễ tìm kiếm**
- Trước: Phải scroll qua 400+ dòng trong 1 file
- Sau: Biết ngay model nằm ở module nào

### 2. **Dễ maintain**
- Trước: 1 file lớn, khó đọc
- Sau: Mỗi file 30-80 dòng, dễ hiểu

### 3. **Scalable**
- Dễ thêm models mới vào module tương ứng
- Không lo file quá lớn

### 4. **Team work**
- Giảm merge conflicts
- Nhiều người có thể làm việc song song

### 5. **Consistency**
- Cấu trúc giống với `views/`
- Dễ học, dễ nhớ

---

## 📝 Quy tắc khi làm việc với models mới

### 1. Thêm model mới

**Ví dụ:** Thêm `ProductGroup` vào module sản xuất

```python
# Bước 1: Tạo file mới
# backend/api/models/san_xuat/product_group.py
from django.db import models

class ProductGroup(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name
```

```python
# Bước 2: Export trong __init__.py của module
# backend/api/models/san_xuat/__init__.py
from .product import Product
from .raw_material import RawMaterial
from .product_bom import ProductBOM
from .product_group import ProductGroup  # ← Thêm dòng này

__all__ = ['Product', 'RawMaterial', 'ProductBOM', 'ProductGroup']
```

```python
# Bước 3: Export trong __init__.py chính
# backend/api/models/__init__.py
from .san_xuat import Product, RawMaterial, ProductBOM, ProductGroup

__all__ = [
    # ...
    'ProductGroup',  # ← Thêm vào __all__
]
```

```bash
# Bước 4: Tạo migration
python manage.py makemigrations
python manage.py migrate
```

### 2. Sửa model hiện có

**Ví dụ:** Thêm field `description` vào `Product`

```python
# Bước 1: Mở file tương ứng
# backend/api/models/san_xuat/product.py

class Product(models.Model):
    # ... các fields hiện có
    description = models.TextField(blank=True)  # ← Thêm field mới
```

```bash
# Bước 2: Tạo migration
python manage.py makemigrations
python manage.py migrate
```

### 3. Import models trong code

```python
# ✅ Cách 1: Import từ api.models (Recommended)
from api.models import User, Product, Customer

# ✅ Cách 2: Import từ module cụ thể
from api.models.auth import User
from api.models.san_xuat import Product
from api.models.ban_hang import Customer

# ✅ Cách 3: Import từ .models (trong api app)
from .models import User, Product, Customer
```

---

## 🧪 Testing Checklist

Sau khi refactor, đã test:

- [x] `python manage.py check` - ✅ No issues
- [x] `python manage.py makemigrations --dry-run` - ✅ No changes
- [x] `python manage.py runserver` - ✅ Server running
- [x] Import models in serializers - ✅ Working
- [x] Import models in views - ✅ Working
- [x] Import models in admin - ✅ Working
- [x] Django admin interface - ✅ Working
- [x] API endpoints - ✅ Working

---

## 📦 Files Changed

### Đã tạo mới (21 files):
- `backend/api/models/__init__.py`
- `backend/api/models/README.md`
- `backend/api/models/MIGRATION_GUIDE.md`
- `backend/api/models/auth/__init__.py`
- `backend/api/models/auth/user.py`
- `backend/api/models/san_xuat/__init__.py`
- `backend/api/models/san_xuat/product.py`
- `backend/api/models/san_xuat/raw_material.py`
- `backend/api/models/san_xuat/product_bom.py`
- `backend/api/models/ban_hang/__init__.py`
- `backend/api/models/ban_hang/customer.py`
- `backend/api/models/ban_hang/order.py`
- `backend/api/models/mua_hang/__init__.py`
- `backend/api/models/mua_hang/material.py`
- `backend/api/models/mua_hang/supplier.py`
- `backend/api/models/mua_hang/purchase_order.py`
- `backend/api/models/cai_dat/__init__.py`
- `backend/api/models/cai_dat/location.py`
- `backend/api/models/cai_dat/shipping_unit.py`
- `backend/api/models_old.py` (backup)
- `REFACTOR_MODELS.md` (documentation)

### Đã sửa (1 file):
- `backend/api/serializers.py` (chuẩn hóa imports)

### Đã xóa (1 file):
- `backend/api/models.py` (đã backup thành `models_old.py`)

---

## ❓ FAQ

### Q: Có cần chạy migration không?
**A:** Không! Không có thay đổi về database schema.

### Q: Code cũ có bị break không?
**A:** Không! 100% tương thích ngược.

### Q: Có cần sửa imports trong code hiện có không?
**A:** Không bắt buộc, nhưng nên dần dần chuyển sang import từ module cụ thể để code rõ ràng hơn.

### Q: File `models_old.py` có thể xóa không?
**A:** Có thể xóa sau khi đã test kỹ và chắc chắn mọi thứ hoạt động tốt.

### Q: Làm sao biết model nằm ở module nào?
**A:** Xem file `backend/api/models/README.md` hoặc nhìn vào cấu trúc folder.

---

## 🚀 Next Steps (Optional)

1. **Refactor Serializers**: Tổ chức serializers theo cấu trúc tương tự
2. **Add Type Hints**: Thêm type hints cho models
3. **Create Base Models**: Tạo base classes cho các models có chung logic
4. **Add Model Tests**: Viết unit tests cho từng model

---

## 📞 Support

Nếu có vấn đề gì, xem:
- `backend/api/models/README.md` - Documentation chi tiết
- `REFACTOR_MODELS.md` - Tổng quan về refactoring
- Git history: `git log --oneline | grep "refactor: restructure models"`
