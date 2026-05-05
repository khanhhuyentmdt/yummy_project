# ─── Nguyên vật liệu ──────────────────────────────────────────────────────────
from .nguyen_vat_lieu import (
    MaterialSerializer, MaterialWriteSerializer,
    MaterialGroupSerializer, MaterialGroupWriteSerializer,
    SupplierSerializer,
    PurchaseOrderSerializer, PurchaseOrderWriteSerializer,
    PurchaseOrderItemReadSerializer, PurchaseOrderItemWriteSerializer,
)

# ─── Bếp trung tâm ────────────────────────────────────────────────────────────
from .bep_trung_tam import (
    ProductSerializer, ProductCreateSerializer,
    ProductGroupSerializer, ProductGroupCreateSerializer,
    RawMaterialSerializer,
    ProductBOMReadSerializer, ProductBOMWriteSerializer,
    SemiFinishedProductSerializer, SemiFinishedProductWriteSerializer,
    SemiFinishedProductBOMReadSerializer, SemiFinishedProductBOMWriteSerializer,
    OrderRequestSerializer, OrderRequestWriteSerializer,
    OrderRequestItemReadSerializer, OrderRequestItemWriteSerializer,
    ProductionPlanSerializer, ProductionPlanWriteSerializer,
    ProductionPlanItemReadSerializer, ProductionPlanItemWriteSerializer,
    ProductionOrderSerializer, ProductionOrderWriteSerializer,
    ProductionOrderItemReadSerializer, ProductionOrderItemWriteSerializer,
    ProductionAcceptanceSerializer, ProductionAcceptanceWriteSerializer,
    ProductionAcceptanceItemReadSerializer, ProductionAcceptanceItemWriteSerializer,
)

# ─── Khu vực bán thành phẩm ───────────────────────────────────────────────────
from .khu_vuc_btp import *


__all__ = [
    # Nguyên vật liệu
    'MaterialSerializer',
    'MaterialWriteSerializer',
    'MaterialGroupSerializer',
    'MaterialGroupWriteSerializer',
    'SupplierSerializer',
    'PurchaseOrderSerializer',
    'PurchaseOrderWriteSerializer',
    'PurchaseOrderItemReadSerializer',
    'PurchaseOrderItemWriteSerializer',
    
    # Bếp trung tâm
    'ProductSerializer',
    'ProductCreateSerializer',
    'ProductGroupSerializer',
    'ProductGroupCreateSerializer',
    'RawMaterialSerializer',
    'ProductBOMReadSerializer',
    'ProductBOMWriteSerializer',
    'SemiFinishedProductSerializer',
    'SemiFinishedProductWriteSerializer',
    'SemiFinishedProductBOMReadSerializer',
    'SemiFinishedProductBOMWriteSerializer',
    'OrderRequestSerializer',
    'OrderRequestWriteSerializer',
    'OrderRequestItemReadSerializer',
    'OrderRequestItemWriteSerializer',
    'ProductionPlanSerializer',
    'ProductionPlanWriteSerializer',
    'ProductionPlanItemReadSerializer',
    'ProductionPlanItemWriteSerializer',
    'ProductionOrderSerializer',
    'ProductionOrderWriteSerializer',
    'ProductionOrderItemReadSerializer',
    'ProductionOrderItemWriteSerializer',
    'ProductionAcceptanceSerializer',
    'ProductionAcceptanceWriteSerializer',
    'ProductionAcceptanceItemReadSerializer',
    'ProductionAcceptanceItemWriteSerializer',
]
