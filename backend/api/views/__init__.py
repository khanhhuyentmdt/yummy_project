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
    product_group_list,
    product_group_detail,
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
    customer_group_list,
    customer_group_detail,
    customer_list,
    customer_detail,
    order_list,
)

# Nhân sự
from .nhan_su import (
    # Thiết lập nhân viên
    employee_list,
    employee_detail,
    employee_bulk_delete,
    employee_role_list,
    employee_account_list,
    # Vietnam Location
    province_list,
    district_list,
    ward_list,
    # Salary & Benefits
    salary_type_list,
    benefits_policy_list,
    # Quản lý chấm công
    shift_list,
    shift_detail,
    shift_bulk_delete,
    schedule_list,
    schedule_detail,
    schedule_bulk_delete,
    attendance_list,
    attendance_detail,
    attendance_bulk_delete,
    # Quản lý lương
    bonus_list,
    bonus_detail,
    bonus_bulk_delete,
    benefit_list,
    benefit_detail,
    benefit_bulk_delete,
    payroll_list,
    payroll_detail,
    payroll_bulk_delete,
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
    location_detail,
    location_bulk_delete,
    staff_user_list,
    shipping_unit_list,
    shipping_unit_detail,
    shipping_unit_bulk_delete,
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
    'product_group_list',
    'product_group_detail',
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
    'customer_group_list',
    'customer_group_detail',
    'customer_list',
    'customer_detail',
    'order_list',
    # Nhân sự - Thiết lập nhân viên
    'employee_list',
    'employee_detail',
    'employee_bulk_delete',
    'employee_role_list',
    'employee_account_list',
    # Nhân sự - Vietnam Location
    'province_list',
    'district_list',
    'ward_list',
    # Nhân sự - Salary & Benefits
    'salary_type_list',
    'benefits_policy_list',
    # Nhân sự - Quản lý chấm công
    'shift_list',
    'shift_detail',
    'shift_bulk_delete',
    'schedule_list',
    'schedule_detail',
    'schedule_bulk_delete',
    'attendance_list',
    'attendance_detail',
    'attendance_bulk_delete',
    # Nhân sự - Quản lý lương
    'bonus_list',
    'bonus_detail',
    'bonus_bulk_delete',
    'benefit_list',
    'benefit_detail',
    'benefit_bulk_delete',
    'payroll_list',
    'payroll_detail',
    'payroll_bulk_delete',
    # Tài chính
    'fund_source_list',
    'cash_book_list',
    'supplier_debt_list',
    'customer_debt_list',
    # Cài đặt
    'location_list',
    'location_detail',
    'location_bulk_delete',
    'staff_user_list',
    'shipping_unit_list',
    'shipping_unit_detail',
    'shipping_unit_bulk_delete',
]
