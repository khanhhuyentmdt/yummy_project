# ─── Import all serializers from submodules ──────────────────────────────────

# Auth
from .auth import PhoneLoginSerializer

# Sản xuất
from .san_xuat import (
    # Nguyên vật liệu
    MaterialSerializer, MaterialWriteSerializer,
    SupplierSerializer,
    PurchaseOrderSerializer, PurchaseOrderWriteSerializer,
    # Bếp trung tâm
    ProductSerializer, ProductCreateSerializer,
    RawMaterialSerializer,
    ProductBOMReadSerializer, ProductBOMWriteSerializer,
)

# Bán hàng
from .ban_hang import CustomerSerializer, OrderSerializer

# Cài đặt
from .cai_dat import (
    LocationSerializer, LocationWriteSerializer, LocationHistorySerializer,
    ShippingUnitSerializer, ShippingUnitWriteSerializer, ShippingUnitHistorySerializer,
)


# ─── Export all serializers ──────────────────────────────────────────────────

__all__ = [
    # Auth
    'PhoneLoginSerializer',
    
    # Sản xuất - Nguyên vật liệu
    'MaterialSerializer',
    'MaterialWriteSerializer',
    'SupplierSerializer',
    'PurchaseOrderSerializer',
    'PurchaseOrderWriteSerializer',
    
    # Sản xuất - Bếp trung tâm
    'ProductSerializer',
    'ProductCreateSerializer',
    'RawMaterialSerializer',
    'ProductBOMReadSerializer',
    'ProductBOMWriteSerializer',
    
    # Bán hàng
    'CustomerSerializer',
    'OrderSerializer',
    
    # Cài đặt
    'LocationSerializer',
    'LocationWriteSerializer',
    'LocationHistorySerializer',
    'ShippingUnitSerializer',
    'ShippingUnitWriteSerializer',
    'ShippingUnitHistorySerializer',
]
