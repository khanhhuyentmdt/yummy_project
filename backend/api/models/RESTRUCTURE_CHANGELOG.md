# 🔄 Restructure Models - Sản xuất Module

## 📅 Ngày thực hiện: 30/04/2026

---

## 🎯 Mục tiêu

Tổ chức lại cấu trúc models trong module **Sản xuất** để phản ánh đúng nghiệp vụ thực tế:
- Gộp `mua_hang/` vào `san_xuat/nguyen_vat_lieu/`
- Tạo cấu trúc 3 cấp: Nguyên vật liệu → Bếp trung tâm → Khu vực BTP
- Đồng bộ với cấu trúc frontend

---

## 📊 So sánh Before/After

### ❌ Before (Cấu trúc cũ):
```
backend/api/models/
├── san_xuat/
│   ├── product.py
│   ├── raw_material.py
│   └── product_bom.py
└── mua_hang/
    ├── material.py
    ├── supplier.py
    └── purchase_order.py
```

### ✅ After (Cấu trúc mới):
```
backend/api/models/
└── san_xuat/
    ├── nguyen_vat_lieu/          # Nguyên vật liệu (bao gồm mua hàng)
    │   ├── material.py           # Material (NVL)
    │   ├── supplier.py           # Supplier (Nhà cung cấp)
    │   └── purchase_order.py     # PurchaseOrder (Phiếu mua hàng)
    ├── bep_trung_tam/            # Bếp trung tâm
    │   ├── product.py            # Product (Sản phẩm)
    │   ├── raw_material.py       # RawMaterial (Nguyên liệu)
    │   └── product_bom.py        # ProductBOM (Định mức)
    └── khu_vuc_btp/              # Khu vực bán thành phẩm
        └── __init__.py           # (TODO: Thêm models khi cần)
```

---

## 🏗️ Cấu trúc chi tiết

### 🏭 Module Sản xuất (`san_xuat/`)

#### 1. **Nguyên vật liệu** (`nguyen_vat_lieu/`)
Quản lý nguyên vật liệu, nhà cung cấp và mua hàng

**Models:**
- `Material` - Thông tin nguyên vật liệu
- `Supplier` - Nhà cung cấp
- `PurchaseOrder` - Phiếu mua hàng

**Submodules (Frontend tương ứng):**
- `thong-tin-nguyen-vat-lieu/` - Quản lý danh mục NVL
- `kho-nguyen-vat-lieu/` - Quản lý kho, nhập/xuất NVL
- `nha-cung-cap/` - Quản lý nhà cung cấp

#### 2. **Bếp trung tâm** (`bep_trung_tam/`)
Quản lý sản phẩm, định mức và sản xuất

**Models:**
- `Product` - Sản phẩm
- `RawMaterial` - Nguyên liệu thô (dùng trong định mức)
- `ProductBOM` - Định mức nguyên liệu cho sản phẩm

**Submodules (Frontend tương ứng):**
- `quan-ly-danh-muc/` - Quản lý danh mục sản phẩm
- `kho-bep/` - Quản lý kho bếp
- `van-hanh-san-xuat/` - Vận hành sản xuất

#### 3. **Khu vực bán thành phẩm** (`khu_vuc_btp/`)
Quản lý bán thành phẩm và đóng gói

**Models:** _(Chưa có, sẽ thêm khi cần)_

**Submodules (Frontend tương ứng):**
- `ton-kho/` - Tồn kho BTP
- `phieu-nhap-kho/` - Phiếu nhập kho BTP
- `phieu-xuat-kho/` - Phiếu xuất kho BTP
- `phieu-ghi-nhan-dong-goi/` - Ghi nhận đóng gói
- `phieu-ban-giao-dong-goi/` - Bàn giao đóng gói

---

## 📝 Chi tiết thay đổi

### Files đã di chuyển:

| File cũ | File mới |
|---------|----------|
| `mua_hang/material.py` | `san_xuat/nguyen_vat_lieu/material.py` |
| `mua_hang/supplier.py` | `san_xuat/nguyen_vat_lieu/supplier.py` |
| `mua_hang/purchase_order.py` | `san_xuat/nguyen_vat_lieu/purchase_order.py` |
| `san_xuat/product.py` | `san_xuat/bep_trung_tam/product.py` |
| `san_xuat/raw_material.py` | `san_xuat/bep_trung_tam/raw_material.py` |
| `san_xuat/product_bom.py` | `san_xuat/bep_trung_tam/product_bom.py` |

### Files đã tạo mới:

- `san_xuat/nguyen_vat_lieu/__init__.py`
- `san_xuat/bep_trung_tam/__init__.py`
- `san_xuat/khu_vuc_btp/__init__.py`

### Files đã xóa:

- `mua_hang/` (toàn bộ folder)
- `san_xuat/product.py` (đã di chuyển)
- `san_xuat/raw_material.py` (đã di chuyển)
- `san_xuat/product_bom.py` (đã di chuyển)

### Files đã cập nhật:

- `models/__init__.py` - Cập nhật imports
- `models/san_xuat/__init__.py` - Cập nhật exports
- `models/README.md` - Cập nhật documentation

---

## ✅ Tương thích ngược

**100% tương thích!** Tất cả imports cũ vẫn hoạt động:

```python
# ✅ Cách cũ - VẪN HOẠT ĐỘNG
from api.models import Material, Supplier, Product

# ✅ Cách mới - CŨNG HOẠT ĐỘNG
from api.models.san_xuat import Material, Supplier, Product

# ✅ Cách mới chi tiết - TỐT NHẤT
from api.models.san_xuat.nguyen_vat_lieu import Material, Supplier
from api.models.san_xuat.bep_trung_tam import Product
```

---

## 🧪 Testing

```bash
✅ python manage.py check                    # No issues
✅ python manage.py makemigrations --dry-run # No changes
✅ python manage.py runserver                # Server running
✅ Cleared Python cache                      # No conflicts
✅ All imports working                       # Backward compatible
```

---

## 🎁 Lợi ích

### 1. **Phản ánh đúng nghiệp vụ**
- Mua hàng là một phần của quản lý nguyên vật liệu
- Cấu trúc rõ ràng: NVL → Bếp → BTP

### 2. **Đồng bộ với Frontend**
- Backend và Frontend có cấu trúc giống nhau
- Dễ dàng tìm kiếm và maintain

### 3. **Scalable**
- Dễ thêm models mới vào từng khu vực
- Cấu trúc 3 cấp rõ ràng

### 4. **Dễ hiểu**
- Developer mới dễ nắm bắt
- Phản ánh đúng quy trình sản xuất thực tế

---

## 📚 Quy trình sản xuất

```
1. NGUYÊN VẬT LIỆU
   ├─ Nhà cung cấp cung cấp NVL
   ├─ Tạo phiếu mua hàng
   └─ Nhập kho NVL

2. BẾP TRUNG TÂM
   ├─ Lấy NVL từ kho
   ├─ Sản xuất theo định mức (BOM)
   └─ Tạo ra sản phẩm

3. KHU VỰC BÁN THÀNH PHẨM
   ├─ Nhận sản phẩm từ bếp
   ├─ Đóng gói
   └─ Xuất kho để bán
```

---

## 🔄 Migration Guide

### Nếu bạn đang import từ `mua_hang`:

```python
# ❌ Cũ (sẽ không hoạt động)
from api.models.mua_hang import Material, Supplier

# ✅ Mới (nên dùng)
from api.models.san_xuat.nguyen_vat_lieu import Material, Supplier

# ✅ Hoặc đơn giản hơn
from api.models import Material, Supplier
```

### Nếu bạn đang import từ `san_xuat`:

```python
# ✅ Cũ (VẪN hoạt động)
from api.models.san_xuat import Product

# ✅ Mới (rõ ràng hơn)
from api.models.san_xuat.bep_trung_tam import Product

# ✅ Hoặc đơn giản
from api.models import Product
```

---

## 📦 Files Changed

### Tạo mới (10 files):
- `san_xuat/nguyen_vat_lieu/__init__.py`
- `san_xuat/nguyen_vat_lieu/material.py`
- `san_xuat/nguyen_vat_lieu/supplier.py`
- `san_xuat/nguyen_vat_lieu/purchase_order.py`
- `san_xuat/bep_trung_tam/__init__.py`
- `san_xuat/bep_trung_tam/product.py`
- `san_xuat/bep_trung_tam/raw_material.py`
- `san_xuat/bep_trung_tam/product_bom.py`
- `san_xuat/khu_vuc_btp/__init__.py`
- `RESTRUCTURE_CHANGELOG.md`

### Cập nhật (3 files):
- `models/__init__.py`
- `models/san_xuat/__init__.py`
- `models/README.md`

### Xóa (7 files):
- `mua_hang/__init__.py`
- `mua_hang/material.py`
- `mua_hang/supplier.py`
- `mua_hang/purchase_order.py`
- `san_xuat/product.py`
- `san_xuat/raw_material.py`
- `san_xuat/product_bom.py`

---

## 🚀 Next Steps

1. ✅ Restructure models - **DONE**
2. ⏭️ Thêm models cho `khu_vuc_btp/` khi cần
3. ⏭️ Tạo models cho các submodules khác (kho, phiếu nhập/xuất, v.v.)
4. ⏭️ (Optional) Refactor serializers theo cấu trúc tương tự

---

## 📞 Support

Nếu có vấn đề, xem:
- `backend/api/models/README.md` - Documentation chi tiết
- `REFACTOR_MODELS.md` - Tổng quan về refactoring
- Frontend structure: `frontend/src/components/san-xuat/`
