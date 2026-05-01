# ─── Import all models from submodules ───────────────────────────────────────

# Auth
from .auth import User, UserManager
from .bootstrap_state import BootstrapState

# Sản xuất
from .san_xuat import (
    # Nguyên vật liệu
    Material, MaterialGroup, Supplier, PurchaseOrder,
    # Bếp trung tâm
    Product, RawMaterial, ProductBOM, ProductGroup,
    SemiFinishedProduct, SemiFinishedProductBOM,
    OrderRequest, OrderRequestItem,
    ProductionPlan, ProductionPlanItem,
    ProductionOrder, ProductionOrderItem,
    ProductionAcceptance, ProductionAcceptanceItem,
)

# Bán hàng
from .ban_hang import Customer, Order

# Nhân sự
from .nhan_su import (
    Employee, EmployeeHistory,
    SalaryType, BenefitsPolicy,
    Province, District, Ward,
    WorkShift, WorkShiftBreak, WorkShiftHistory,
    WorkSchedule, WorkScheduleHistory,
    Attendance, AttendanceHistory,
    Bonus, BonusHistory,
    Benefit, BenefitHistory,
    Payroll, PayrollEmployee, PayrollHistory,
)

# Tài chính
from .tai_chinh import *

# Cài đặt
from .cai_dat import Location, LocationHistory, ShippingUnit, ShippingUnitHistory


# ─── Export all models ────────────────────────────────────────────────────────

__all__ = [
    # Auth
    'User',
    'UserManager',
    'BootstrapState',

    # Sản xuất - Nguyên vật liệu
    'Material',
    'MaterialGroup',
    'Supplier',
    'PurchaseOrder',

    # Sản xuất - Bếp trung tâm
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

    # Bán hàng
    'Customer',
    'Order',

    # Nhân sự
    'Employee',
    'EmployeeHistory',
    'SalaryType',
    'BenefitsPolicy',
    'Province',
    'District',
    'Ward',
    'WorkShift',
    'WorkShiftBreak',
    'WorkShiftHistory',
    'WorkSchedule',
    'WorkScheduleHistory',
    'Attendance',
    'AttendanceHistory',
    'Bonus',
    'BonusHistory',
    'Benefit',
    'BenefitHistory',
    'Payroll',
    'PayrollEmployee',
    'PayrollHistory',

    # Cài đặt
    'Location',
    'LocationHistory',
    'ShippingUnit',
    'ShippingUnitHistory',
]
