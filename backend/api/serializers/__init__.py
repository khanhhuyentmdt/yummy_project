# ─── Import all serializers from submodules ──────────────────────────────────

# Auth
from .auth import PhoneLoginSerializer

# Sản xuất
from .san_xuat import (
    # Nguyên vật liệu
    MaterialSerializer, MaterialWriteSerializer,
    MaterialGroupSerializer, MaterialGroupWriteSerializer,
    SupplierSerializer,
    PurchaseOrderSerializer, PurchaseOrderWriteSerializer,
    PurchaseOrderItemReadSerializer, PurchaseOrderItemWriteSerializer,
    # Kho nguyên vật liệu
    WarehouseReceiptSerializer, WarehouseReceiptWriteSerializer,
    WarehouseReceiptItemReadSerializer, WarehouseReceiptItemWriteSerializer,
    WarehouseReceiptHistorySerializer,
    MaterialInventorySerializer,
    # Bếp trung tâm
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

# Bán hàng
from .ban_hang import CustomerSerializer, OrderSerializer

# Nhân sự
from .nhan_su import (
    EmployeeSerializer, EmployeeWriteSerializer, EmployeeHistorySerializer,
    ProvinceSerializer, DistrictSerializer, WardSerializer,
    SalaryTypeSerializer, BenefitsPolicySerializer,
    WorkShiftSerializer, WorkShiftWriteSerializer,
    WorkShiftBreakSerializer, WorkShiftHistorySerializer,
    WorkScheduleSerializer, WorkScheduleWriteSerializer, WorkScheduleHistorySerializer,
    AttendanceSerializer, AttendanceWriteSerializer, AttendanceHistorySerializer,
    BonusSerializer, BonusWriteSerializer, BonusHistorySerializer,
)

# Tài chính
from .tai_chinh import *

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
    'MaterialGroupSerializer',
    'MaterialGroupWriteSerializer',
    'SupplierSerializer',
    'PurchaseOrderSerializer',
    'PurchaseOrderWriteSerializer',
    'PurchaseOrderItemReadSerializer',
    'PurchaseOrderItemWriteSerializer',

    # Sản xuất - Kho nguyên vật liệu
    'WarehouseReceiptSerializer',
    'WarehouseReceiptWriteSerializer',
    'WarehouseReceiptItemReadSerializer',
    'WarehouseReceiptItemWriteSerializer',
    'WarehouseReceiptHistorySerializer',
    'MaterialInventorySerializer',

    # Sản xuất - Bếp trung tâm
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

    # Bán hàng
    'CustomerSerializer',
    'OrderSerializer',

    # Nhân sự
    'EmployeeSerializer',
    'EmployeeWriteSerializer',
    'EmployeeHistorySerializer',
    'ProvinceSerializer',
    'DistrictSerializer',
    'WardSerializer',
    'SalaryTypeSerializer',
    'BenefitsPolicySerializer',
    'WorkShiftSerializer',
    'WorkShiftWriteSerializer',
    'WorkShiftBreakSerializer',
    'WorkShiftHistorySerializer',
    'WorkScheduleSerializer',
    'WorkScheduleWriteSerializer',
    'WorkScheduleHistorySerializer',
    'AttendanceSerializer',
    'AttendanceWriteSerializer',
    'AttendanceHistorySerializer',
    'BonusSerializer',
    'BonusWriteSerializer',
    'BonusHistorySerializer',

    # Cài đặt
    'LocationSerializer',
    'LocationWriteSerializer',
    'LocationHistorySerializer',
    'ShippingUnitSerializer',
    'ShippingUnitWriteSerializer',
    'ShippingUnitHistorySerializer',
]
