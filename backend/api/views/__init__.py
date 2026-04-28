"""
API Views - Organized by module structure

Cấu trúc views được tổ chức theo đúng menu sidebar:
- auth: Authentication (Login)
- tong_quan: Dashboard & Statistics
- san_xuat: Production (Products, Materials, Purchase Orders, Semi-finished)
- ban_hang: Sales (Customers, Orders)
- nhan_su: HR (Employees, Attendance, Payroll)
- tai_chinh: Finance (Fund, Cash Book, Debts)
- cai_dat: Settings (Locations, Shipping Units)
"""

# Auth
from .auth import PhoneLoginView

# Tổng quan
from .tong_quan import dashboard_stats

# Sản xuất
from .san_xuat import (
    # Bếp trung tâm - Products
    product_list,
    product_detail,
    product_sync,
    # Nguyên vật liệu - Materials
    material_list,
    material_detail,
    raw_material_list,
    # Nguyên vật liệu - Purchase
    supplier_list,
    purchase_order_list,
    purchase_order_detail,
    # Khu vực BTP
    semi_finished_inventory,
    semi_finished_receipt,
    semi_finished_issue,
    packaging_handover,
    packaging_record,
)

# Bán hàng
from .ban_hang import (
    customer_list,
    order_list,
)

# Nhân sự
from .nhan_su import (
    # Thiết lập nhân viên
    employee_list,
    employee_role_list,
    employee_account_list,
    # Quản lý chấm công
    shift_list,
    schedule_list,
    attendance_list,
    # Quản lý lương
    bonus_list,
    benefit_list,
    payroll_list,
)

# Tài chính
from .tai_chinh import (
    fund_source_list,
    cash_book_list,
    supplier_debt_list,
    customer_debt_list,
)

# Cài đặt
from .cai_dat import (
    location_list,
    shipping_unit_list,
)

__all__ = [
    # Auth
    'PhoneLoginView',
    # Tổng quan
    'dashboard_stats',
    # Sản xuất - Bếp trung tâm
    'product_list',
    'product_detail',
    'product_sync',
    # Sản xuất - Nguyên vật liệu
    'material_list',
    'material_detail',
    'raw_material_list',
    'supplier_list',
    'purchase_order_list',
    'purchase_order_detail',
    # Sản xuất - Khu vực BTP
    'semi_finished_inventory',
    'semi_finished_receipt',
    'semi_finished_issue',
    'packaging_handover',
    'packaging_record',
    # Bán hàng
    'customer_list',
    'order_list',
    # Nhân sự - Thiết lập nhân viên
    'employee_list',
    'employee_role_list',
    'employee_account_list',
    # Nhân sự - Quản lý chấm công
    'shift_list',
    'schedule_list',
    'attendance_list',
    # Nhân sự - Quản lý lương
    'bonus_list',
    'benefit_list',
    'payroll_list',
    # Tài chính
    'fund_source_list',
    'cash_book_list',
    'supplier_debt_list',
    'customer_debt_list',
    # Cài đặt
    'location_list',
    'shipping_unit_list',
]
