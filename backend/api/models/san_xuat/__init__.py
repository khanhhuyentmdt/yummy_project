# ─── Nguyên vật liệu ──────────────────────────────────────────────────────────
from .nguyen_vat_lieu import Material, MaterialGroup, Supplier, PurchaseOrder, PurchaseOrderItem

# ─── Kho nguyên vật liệu ──────────────────────────────────────────────────────
from .kho import WarehouseReceipt, WarehouseReceiptItem, WarehouseReceiptHistory, MaterialInventory

# ─── Bếp trung tâm ────────────────────────────────────────────────────────────
from .bep_trung_tam import (
    Product,
    ProductGroup,
    RawMaterial,
    ProductBOM,
    SemiFinishedProduct,
    SemiFinishedProductBOM,
    OrderRequest,
    OrderRequestItem,
    ProductionPlan,
    ProductionPlanItem,
    ProductionOrder,
    ProductionOrderItem,
    ProductionAcceptance,
    ProductionAcceptanceItem,
)

# ─── Khu vực bán thành phẩm ───────────────────────────────────────────────────
from .khu_vuc_btp import *


__all__ = [
    # Nguyên vật liệu
    'Material',
    'MaterialGroup',
    'Supplier',
    'PurchaseOrder',
    'PurchaseOrderItem',

    # Kho nguyên vật liệu
    'WarehouseReceipt',
    'WarehouseReceiptItem',
    'WarehouseReceiptHistory',
    'MaterialInventory',
    
    # Bếp trung tâm
    'Product',
    'ProductGroup',
    'RawMaterial',
    'ProductBOM',
    'SemiFinishedProduct',
    'SemiFinishedProductBOM',
    'OrderRequest',
    'OrderRequestItem',
    'ProductionPlan',
    'ProductionPlanItem',
    'ProductionOrder',
    'ProductionOrderItem',
    'ProductionAcceptance',
    'ProductionAcceptanceItem',
]
