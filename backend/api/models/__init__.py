# ─── Import all models from submodules ───────────────────────────────────────

# Auth
from .auth import User, UserManager

# Sản xuất
from .san_xuat import Product, RawMaterial, ProductBOM

# Bán hàng
from .ban_hang import Customer, Order

# Mua hàng
from .mua_hang import Material, Supplier, PurchaseOrder

# Cài đặt
from .cai_dat import Location, LocationHistory, ShippingUnit, ShippingUnitHistory


# ─── Export all models ────────────────────────────────────────────────────────

__all__ = [
    # Auth
    'User',
    'UserManager',
    
    # Sản xuất
    'Product',
    'RawMaterial',
    'ProductBOM',
    
    # Bán hàng
    'Customer',
    'Order',
    
    # Mua hàng
    'Material',
    'Supplier',
    'PurchaseOrder',
    
    # Cài đặt
    'Location',
    'LocationHistory',
    'ShippingUnit',
    'ShippingUnitHistory',
]
