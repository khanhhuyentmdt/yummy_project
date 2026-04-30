# 🔄 Refactor Models Structure

## 📅 Ngày thực hiện: 30/04/2026

---

## 🎯 Mục tiêu

Tổ chức lại cấu trúc models từ **1 file lớn** thành **nhiều file nhỏ** theo module nghiệp vụ, tương tự như cấu trúc của `views/`.

---

## 📊 So sánh Before/After

### ❌ Before (Cấu trúc cũ):
```
backend/api/
├── models.py          # 1 file chứa 15+ models (400+ dòng)
├── views/
│   ├── auth/
│   ├── san_xuat/
│   ├── ban_hang/
│   └── ...
```

### ✅ After (Cấu trúc mới):
```
backend/api/
├── models/            # Folder chứa models theo module
│   ├── __init__.py
│   ├── auth/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── san_xuat/
│   │   ├── __init__.py
│   │   ├── product.py
│   │   ├── raw_material.py
│   │   └── product_bom.py
│   ├── ban_hang/
│   │   ├── __init__.py
│   │   ├── customer.py
│   │   └── order.py
│   ├── mua_hang/
│   │   ├── __init__.py
│   │   ├── material.py
│   │   ├── supplier.py
│   │   └── purchase_order.py
│   └── cai_dat/
│       ├── __init__.py
│       ├── location.py
│       └── shipping_unit.py
├── models_old.py      # Backup file cũ
└── views/
    ├── auth/
    ├── san_xuat/
    └── ...
```

---

## 📝 Chi tiết thay đổi

### 1. Tạo cấu trúc folder mới

```bash
backend/api/models/
├── auth/              # 1 file: user.py
├── san_xuat/          # 3 files: product.py, raw_material.py, product_bom.py
├── ban_hang/          # 2 files: customer.py, order.py
├── mua_hang/          # 3 files: material.py, supplier.py, purchase_order.py
└── cai_dat/           # 2 files: location.py, shipping_unit.py
```

### 2. Phân tách models

| Module | Models | File |
|--------|--------|------|
| **auth** | User, UserManager | `auth/user.py` |
| **san_xuat** | Product | `san_xuat/product.py` |
| | RawMaterial | `san_xuat/raw_material.py` |
| | ProductBOM | `san_xuat/product_bom.py` |
| **ban_hang** | Customer | `ban_hang/customer.py` |
| | Order | `ban_hang/order.py` |
| **mua_hang** | Material | `mua_hang/material.py` |
| | Supplier | `mua_hang/supplier.py` |
| | PurchaseOrder | `mua_hang/purchase_order.py` |
| **cai_dat** | Location, LocationHistory | `cai_dat/location.py` |
| | ShippingUnit, ShippingUnitHistory | `cai_dat/shipping_unit.py` |

### 3. Export models

Mỗi module có file `__init__.py` để export models:

```python
# backend/api/models/san_xuat/__init__.py
from .product import Product
from .raw_material import RawMaterial
from .product_bom import ProductBOM

__all__ = ['Product', 'RawMaterial', 'ProductBOM']
```

File `models/__init__.py` chính import tất cả:

```python
# backend/api/models/__init__.py
from .auth import User, UserManager
from .san_xuat import Product, RawMaterial, ProductBOM
from .ban_hang import Customer, Order
from .mua_hang import Material, Supplier, PurchaseOrder
from .cai_dat import Location, LocationHistory, ShippingUnit, ShippingUnitHistory

__all__ = [...]
```

---

## ✅ Kết quả

### Tương thích ngược: 100%
- ✅ Tất cả imports cũ vẫn hoạt động: `from api.models import User, Product`
- ✅ Không cần sửa code trong serializers, views, admin
- ✅ Không cần tạo migration mới
- ✅ Database schema không thay đổi

### Testing:
```bash
✅ python manage.py check                    # No issues
✅ python manage.py makemigrations --dry-run # No changes detected
✅ python manage.py runserver                # Server running successfully
✅ Import models in serializers              # Working
✅ Import models in views                    # Working
```

---

## 🎁 Lợi ích

1. **Dễ tìm kiếm**: Biết ngay model nằm ở module nào
2. **Dễ maintain**: Mỗi file nhỏ, dễ đọc, dễ sửa
3. **Scalable**: Dễ thêm models mới
4. **Consistency**: Cấu trúc giống với `views/`
5. **Team work**: Nhiều người có thể làm việc song song mà ít conflict

---

## 📦 Files đã tạo

**Tổng cộng: 17 files mới**

### Models:
- `backend/api/models/__init__.py`
- `backend/api/models/README.md`
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

### Backup:
- `backend/api/models_old.py` (backup file cũ)

---

## 🚀 Next Steps

1. ✅ Refactor models - **DONE**
2. ⏭️ (Optional) Refactor serializers theo cấu trúc tương tự
3. ⏭️ (Optional) Tạo base classes cho các models có chung logic
4. ⏭️ (Optional) Thêm type hints cho models

---

## 📚 Documentation

Chi tiết về cấu trúc và cách sử dụng: `backend/api/models/README.md`
