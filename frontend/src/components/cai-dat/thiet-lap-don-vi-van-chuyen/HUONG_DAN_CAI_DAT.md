# HƯỚNG DẪN CÀI ĐẶT MODULE ĐƠN VỊ VẬN CHUYỂN

Module đã được tạo đầy đủ trong folder `thiet-lap-don-vi-van-chuyen/`. 
Để module hoạt động, bạn cần thực hiện các bước sau:

---

## 📋 BƯỚC 1: Cập nhật Backend Models

### File: `backend/api/models.py`

Thêm 2 models vào cuối file (sau model `PurchaseOrder`):

```python
# ─── ShippingUnit ─────────────────────────────────────────────────────────────

class ShippingUnit(models.Model):
    STATUS_ACTIVE   = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES  = [
        (STATUS_ACTIVE,   'Dang hoat dong'),
        (STATUS_INACTIVE, 'Tam ngung'),
    ]

    code     = models.CharField(max_length=20, unique=True, verbose_name='Ma don vi')
    name     = models.CharField(max_length=200, unique=True, verbose_name='Ten don vi van chuyen')
    phone    = models.CharField(max_length=20, blank=True, verbose_name='So dien thoai')
    status   = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name='Trang thai',
    )
    created_by_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi tao')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-id']
        verbose_name = 'ShippingUnit'

    def __str__(self):
        return f'{self.code} — {self.name}'


# ─── ShippingUnitHistory ──────────────────────────────────────────────────────

class ShippingUnitHistory(models.Model):
    shipping_unit = models.ForeignKey(
        ShippingUnit, on_delete=models.CASCADE, related_name='history',
        verbose_name='Don vi van chuyen',
    )
    timestamp  = models.DateTimeField(auto_now_add=True)
    actor_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi thuc hien')
    action     = models.CharField(max_length=300, verbose_name='Hanh dong')

    class Meta:
        ordering     = ['-timestamp']
        verbose_name = 'ShippingUnitHistory'

    def __str__(self):
        return f'{self.shipping_unit.code} — {self.action}'
```

---

## 📋 BƯỚC 2: Cập nhật Serializers

### File: `backend/api/serializers.py`

Thêm import ở đầu file (nếu chưa có):
```python
from api.models import ShippingUnit, ShippingUnitHistory
```

Thêm 3 serializers vào cuối file:

```python
# ─── ShippingUnit Serializers ─────────────────────────────────────────────────

class ShippingUnitHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ShippingUnitHistory
        fields = ['id', 'timestamp', 'actor_name', 'action']


class ShippingUnitSerializer(serializers.ModelSerializer):
    history = ShippingUnitHistorySerializer(many=True, read_only=True)

    class Meta:
        model  = ShippingUnit
        fields = ['id', 'code', 'name', 'phone', 'status', 'created_by_name', 'created_at', 'updated_at', 'history']


class ShippingUnitWriteSerializer(serializers.Serializer):
    name   = serializers.CharField(max_length=200)
    phone  = serializers.CharField(max_length=20, required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=['active', 'inactive'], default='active')

    def validate_name(self, value):
        qs = ShippingUnit.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Tên đơn vị vận chuyển này đã được sử dụng.')
        return value

    def create(self, validated_data):
        # Auto-generate code MDVC{6-digit}
        last = ShippingUnit.objects.order_by('-id').first()
        next_id = (last.id + 1) if last else 1
        code = f'MDVC{next_id:06d}'
        return ShippingUnit.objects.create(code=code, **validated_data)

    def update(self, instance, validated_data):
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance
```

---

## 📋 BƯỚC 3: Cập nhật URLs

### File: `backend/api/urls.py`

Tìm phần import views, thêm:
```python
from api.views.cai_dat import shipping_unit_list, shipping_unit_detail, shipping_unit_bulk_delete
```

Hoặc nếu đã có:
```python
from api.views import cai_dat as cai_dat_views
```

Thì trong `urlpatterns`, thêm 3 routes (đặt trước route `locations/<int:pk>/`):

```python
urlpatterns = [
    # ... các route khác ...
    
    # Shipping Units
    path('shipping-units/', views.shipping_unit_list, name='shipping_unit_list'),
    path('shipping-units/bulk-delete/', views.shipping_unit_bulk_delete, name='shipping_unit_bulk_delete'),
    path('shipping-units/<int:pk>/', views.shipping_unit_detail, name='shipping_unit_detail'),
    
    # ... các route khác ...
]
```

---

## 📋 BƯỚC 4: Chạy Migration

Mở terminal và chạy:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## 📋 BƯỚC 5: Cập nhật Frontend - Sidebar Config

### File: `frontend/src/config/sidebarConfig.js`

Tìm dòng (khoảng dòng 380):
```javascript
{
  id: "thiet-lap-vchuyen",
  label: "Thiết lập đơn vị vận chuyển",
  roles: null,
  view: "coming-soon",  // ← Đổi dòng này
},
```

Đổi thành:
```javascript
{
  id: "thiet-lap-vchuyen",
  label: "Thiết lập đơn vị vận chuyển",
  roles: null,
  view: "shipping-units",  // ← Đổi thành "shipping-units"
},
```

---

## 📋 BƯỚC 6: Cập nhật Frontend - HomePage

### File: `frontend/src/components/tong-quan/trang-chu/HomePage.jsx`

#### 6.1. Thêm import (khoảng dòng 36):
```javascript
import LocationsPage from "../../cai-dat/thiet-lap-dia-diem/LocationsPage";
import ShippingUnitsPage from "../../cai-dat/thiet-lap-don-vi-van-chuyen/ShippingUnitsPage";  // ← Thêm dòng này
import Sidebar from "../../common/Sidebar";
```

#### 6.2. Thêm render (khoảng dòng 906-908, sau `{activeView === "locations" && ...}`):
```javascript
{activeView === "locations" && (
  <LocationsPage />
)}
{activeView === "shipping-units" && (
  <ShippingUnitsPage />
)}
{![
  "dashboard",
  "products",
  // ... các view khác
```

Hoặc tìm dòng:
```javascript
{![
  "dashboard",
  "products",
  "create-product",
  "edit-product",
  "materials",
  "create-material",
  "purchase-orders",
  "locations",
].includes(activeView) && <ComingSoonView />}
```

Thêm `"shipping-units"` vào mảng:
```javascript
{![
  "dashboard",
  "products",
  "create-product",
  "edit-product",
  "materials",
  "create-material",
  "purchase-orders",
  "locations",
  "shipping-units",  // ← Thêm dòng này
].includes(activeView) && <ComingSoonView />}
```

---

## 📋 BƯỚC 7: (Optional) Seed Data

Tạo file `backend/api/management/commands/seed_shipping_units.py`:

```python
from django.core.management.base import BaseCommand
from api.models import ShippingUnit

class Command(BaseCommand):
    help = 'Seed shipping units data'

    def handle(self, *args, **options):
        data = [
            {'code': 'MDVC001', 'name': 'Giao Hang Nhanh', 'phone': '1900 0091', 'status': 'active'},
            {'code': 'MDVC002', 'name': 'Giao Hang Tiet Kiem', 'phone': '1900 0092', 'status': 'active'},
            {'code': 'MDVC003', 'name': 'Viettel Post', 'phone': '1900 8095', 'status': 'active'},
            {'code': 'MDVC004', 'name': 'VNPost', 'phone': '1900 0000', 'status': 'active'},
            {'code': 'MDVC005', 'name': 'J&T Express', 'phone': '1900 1088', 'status': 'inactive'},
        ]
        
        for item in data:
            ShippingUnit.objects.get_or_create(
                code=item['code'],
                defaults={
                    'name': item['name'],
                    'phone': item['phone'],
                    'status': item['status'],
                    'created_by_name': 'System',
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(data)} shipping units'))
```

Chạy:
```bash
python manage.py seed_shipping_units
```

---

## ✅ HOÀN TẤT!

Sau khi làm xong các bước trên:
1. Restart backend server (Ctrl+C rồi chạy lại `python manage.py runserver 2344`)
2. Reload frontend (Ctrl+R trên browser)
3. Vào Sidebar → Cài đặt → Thiết lập đơn vị vận chuyển

Module sẽ hoạt động đầy đủ với:
- ✅ Danh sách đơn vị vận chuyển
- ✅ Thêm mới (auto-gen mã MDVC)
- ✅ Chỉnh sửa (với audit trail)
- ✅ Xóa đơn lẻ và xóa hàng loạt
- ✅ Search, filter, sort, pagination
- ✅ Checkbox cam với tick trắng
- ✅ UI đồng nhất với module Location

---

**Lưu ý:** Tất cả code trong folder `thiet-lap-don-vi-van-chuyen/` đã hoàn chỉnh và tuân thủ 100% quy chuẩn dự án!
