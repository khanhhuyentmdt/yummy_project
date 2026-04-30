# 📁 Cấu trúc Serializers - ERP Yummy

## 🎯 Mục tiêu
Tổ chức serializers theo module nghiệp vụ, đồng bộ với cấu trúc models và frontend components.

---

## 📂 Cấu trúc thư mục

```
backend/api/serializers/
├── __init__.py                              # Import và export tất cả serializers
├── auth/                                    # Module xác thực
│   ├── __init__.py
│   └── login.py                             # PhoneLoginSerializer
├── san_xuat/                                # Module sản xuất
│   ├── __init__.py
│   ├── nguyen_vat_lieu/                     # Nguyên vật liệu
│   │   ├── __init__.py
│   │   ├── material.py                      # MaterialSerializer, MaterialWriteSerializer
│   │   ├── supplier.py                      # SupplierSerializer
│   │   └── purchase_order.py                # PurchaseOrderSerializer, PurchaseOrderWriteSerializer
│   ├── bep_trung_tam/                       # Bếp trung tâm
│   │   ├── __init__.py
│   │   ├── product.py                       # ProductSerializer, ProductCreateSerializer
│   │   ├── raw_material.py                  # RawMaterialSerializer
│   │   └── product_bom.py                   # ProductBOMReadSerializer, ProductBOMWriteSerializer
│   └── khu_vuc_btp/                         # Khu vực bán thành phẩm
│       └── __init__.py                      # (TODO: Thêm serializers khi cần)
├── ban_hang/                                # Module bán hàng
│   ├── __init__.py
│   ├── customer.py                          # CustomerSerializer
│   └── order.py                             # OrderSerializer
└── cai_dat/                                 # Module cài đặt
    ├── __init__.py
    ├── location.py                          # LocationSerializer, LocationWriteSerializer, LocationHistorySerializer
    └── shipping_unit.py                     # ShippingUnitSerializer, ShippingUnitWriteSerializer, ShippingUnitHistorySerializer
```

---

## 📋 Danh sách Serializers

### 🔐 Auth (`auth/`)
- **PhoneLoginSerializer** - Xác thực bằng số điện thoại

### 🏭 Sản xuất (`san_xuat/`)

#### Nguyên vật liệu (`nguyen_vat_lieu/`)
- **MaterialSerializer** - Đọc thông tin nguyên vật liệu
- **MaterialWriteSerializer** - Tạo/cập nhật nguyên vật liệu
- **SupplierSerializer** - Nhà cung cấp
- **PurchaseOrderSerializer** - Đọc phiếu mua hàng
- **PurchaseOrderWriteSerializer** - Tạo/cập nhật phiếu mua hàng

#### Bếp trung tâm (`bep_trung_tam/`)
- **ProductSerializer** - Đọc thông tin sản phẩm (có BOM)
- **ProductCreateSerializer** - Tạo/cập nhật sản phẩm
- **RawMaterialSerializer** - Nguyên liệu thô
- **ProductBOMReadSerializer** - Đọc định mức
- **ProductBOMWriteSerializer** - Tạo/cập nhật định mức

#### Khu vực bán thành phẩm (`khu_vuc_btp/`)
- _(Chưa có serializers, sẽ thêm khi cần)_

### 🛒 Bán hàng (`ban_hang/`)
- **CustomerSerializer** - Khách hàng
- **OrderSerializer** - Đơn hàng

### ⚙️ Cài đặt (`cai_dat/`)
- **LocationSerializer** - Đọc thông tin địa điểm
- **LocationWriteSerializer** - Tạo/cập nhật địa điểm
- **LocationHistorySerializer** - Lịch sử địa điểm
- **ShippingUnitSerializer** - Đọc thông tin đối tác vận chuyển
- **ShippingUnitWriteSerializer** - Tạo/cập nhật đối tác vận chuyển
- **ShippingUnitHistorySerializer** - Lịch sử đối tác vận chuyển

---

## 🔧 Cách sử dụng

### Import serializers trong code:

```python
# Cách 1: Import trực tiếp từ api.serializers (Recommended)
from api.serializers import ProductSerializer, MaterialSerializer, CustomerSerializer

# Cách 2: Import từ module cụ thể
from api.serializers.san_xuat import ProductSerializer, MaterialSerializer
from api.serializers.ban_hang import CustomerSerializer, OrderSerializer
from api.serializers.cai_dat import LocationSerializer, ShippingUnitSerializer

# Cách 3: Import từ submodule chi tiết
from api.serializers.san_xuat.bep_trung_tam import ProductSerializer
from api.serializers.san_xuat.nguyen_vat_lieu import MaterialSerializer
from api.serializers.ban_hang import CustomerSerializer
```

### Trong views:

```python
from api.serializers import ProductSerializer, ProductCreateSerializer

# GET - Đọc dữ liệu
def product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)

# POST - Tạo mới
def product_create(request):
    serializer = ProductCreateSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.save()
        return Response(ProductSerializer(product, context={'request': request}).data)
    return Response(serializer.errors, status=400)
```

---

## ✅ Lợi ích của cấu trúc mới

1. **Dễ tìm kiếm**: Serializers được nhóm theo module nghiệp vụ
2. **Dễ maintain**: Mỗi file chỉ chứa 1-3 serializers liên quan
3. **Scalable**: Dễ dàng thêm serializers mới vào module tương ứng
4. **Rõ ràng**: Cấu trúc phản ánh đúng nghiệp vụ của hệ thống
5. **Đồng bộ**: Cấu trúc giống với `models/` và `views/`

---

## 📝 Quy tắc khi thêm serializer mới

1. **Xác định module nghiệp vụ**: Serializer thuộc module nào?
   - `auth/` - Xác thực, người dùng
   - `san_xuat/nguyen_vat_lieu/` - Nguyên vật liệu, nhà cung cấp, mua hàng
   - `san_xuat/bep_trung_tam/` - Sản phẩm, định mức, kho bếp
   - `san_xuat/khu_vuc_btp/` - Bán thành phẩm
   - `ban_hang/` - Khách hàng, đơn hàng
   - `cai_dat/` - Cài đặt hệ thống

2. **Tạo file mới**: Tạo file `.py` trong folder tương ứng
3. **Export trong `__init__.py`**: Thêm import vào file `__init__.py` của module
4. **Export trong `serializers/__init__.py`**: Thêm vào file `__init__.py` chính

### Ví dụ: Thêm ProductGroupSerializer vào bếp trung tâm

```python
# 1. Tạo file: backend/api/serializers/san_xuat/bep_trung_tam/product_group.py
from rest_framework import serializers
from api.models import ProductGroup

class ProductGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductGroup
        fields = ['id', 'name', 'description']

# 2. Cập nhật: backend/api/serializers/san_xuat/bep_trung_tam/__init__.py
from .product import ProductSerializer, ProductCreateSerializer
from .raw_material import RawMaterialSerializer
from .product_bom import ProductBOMReadSerializer, ProductBOMWriteSerializer
from .product_group import ProductGroupSerializer  # ← Thêm dòng này

__all__ = [
    'ProductSerializer',
    'ProductCreateSerializer',
    'RawMaterialSerializer',
    'ProductBOMReadSerializer',
    'ProductBOMWriteSerializer',
    'ProductGroupSerializer',  # ← Thêm vào __all__
]

# 3. Cập nhật: backend/api/serializers/san_xuat/__init__.py
from .bep_trung_tam import (
    ProductSerializer, ProductCreateSerializer,
    RawMaterialSerializer,
    ProductBOMReadSerializer, ProductBOMWriteSerializer,
    ProductGroupSerializer,  # ← Thêm dòng này
)

__all__ = [
    # ...
    'ProductGroupSerializer',  # ← Thêm vào __all__
]

# 4. Cập nhật: backend/api/serializers/__init__.py
from .san_xuat import (
    # ...
    ProductGroupSerializer,  # ← Thêm dòng này
)

__all__ = [
    # ...
    'ProductGroupSerializer',  # ← Thêm vào __all__
]
```

---

## 🔄 Migration từ cấu trúc cũ

**File cũ**: `backend/api/serializers.py` (1 file chứa tất cả serializers)

**File mới**: `backend/api/serializers/` (folder với nhiều file con)

**Backup**: File cũ đã được backup tại `backend/api/serializers_old.py`

**Tương thích ngược**: ✅ 100% tương thích
- Tất cả imports cũ vẫn hoạt động bình thường
- Không cần thay đổi code hiện có trong views

---

## 🧪 Testing

Sau khi refactor, đã test:
- ✅ `python manage.py check` - Không có lỗi
- ✅ Backend server running successfully
- ✅ Import serializers trong views - Hoạt động bình thường
- ✅ API endpoints - Hoạt động bình thường

---

## 📚 Tham khảo

- Django REST Framework: https://www.django-rest-framework.org/
- Serializer Relations: https://www.django-rest-framework.org/api-guide/relations/
- Nested Serializers: https://www.django-rest-framework.org/api-guide/serializers/#dealing-with-nested-objects
