from django.urls import path
from .views import (
    # Auth
    PhoneLoginView,
    # Tổng quan
    dashboard_stats,
    # Sản xuất - Bếp trung tâm
    production_defaults_bootstrap,
    product_list,
    product_detail,
    product_sync,
    product_group_list,
    product_group_detail,
    semi_finished_product_list,
    semi_finished_product_detail,
    order_request_list,
    order_request_detail,
    production_plan_list,
    production_plan_detail,
    production_order_list,
    production_order_detail,
    production_acceptance_list,
    production_acceptance_detail,
    # Sản xuất - Nguyên vật liệu
    material_list,
    material_detail,
    material_group_list,
    material_group_detail,
    raw_material_list,
    supplier_list,
    supplier_detail,
    purchase_order_list,
    purchase_order_detail,
    # Sản xuất - Khu vực BTP
    semi_finished_inventory,
    semi_finished_receipt,
    semi_finished_issue,
    packaging_handover,
    packaging_record,
    # Bán hàng
    customer_group_list,
    customer_group_detail,
    customer_list,
    customer_detail,
    order_list,
    # Nhân sự
    employee_list,
    employee_detail,
    employee_bulk_delete,
    employee_role_list,
    employee_account_list,
    province_list,
    district_list,
    ward_list,
    salary_type_list,
    benefits_policy_list,
    shift_list,
    shift_detail,
    shift_bulk_delete,
    schedule_list,
    schedule_detail,
    schedule_bulk_delete,
    attendance_list,
    attendance_detail,
    attendance_bulk_delete,
    bonus_list,
    bonus_detail,
    bonus_bulk_delete,
    benefit_list,
    benefit_detail,
    benefit_bulk_delete,
    payroll_list,
    payroll_detail,
    payroll_bulk_delete,
    # Tài chính
    fund_source_list,
    cash_book_list,
    supplier_debt_list,
    customer_debt_list,
    # Cài đặt
    location_list,
    location_detail,
    location_bulk_delete,
    staff_user_list,
    shipping_unit_list,
    shipping_unit_detail,
    shipping_unit_bulk_delete,
)

urlpatterns = [
    # ─── Auth ─────────────────────────────────────────────────────────────────
    path('auth/login/', PhoneLoginView.as_view(), name='login'),

    # ─── Dashboard ────────────────────────────────────────────────────────────
    path('dashboard/', dashboard_stats, name='dashboard-stats'),

    # ─── Sản xuất > Bếp trung tâm > Sản phẩm ─────────────────────────────────
    path('production-defaults/bootstrap/', production_defaults_bootstrap, name='production-defaults-bootstrap'),
    path('products/',             product_list,   name='product-list'),
    path('products/sync/',        product_sync,   name='product-sync'),
    path('products/<int:pk>/',    product_detail, name='product-detail'),
    path('product-groups/',             product_group_list,   name='product-group-list'),
    path('product-groups/<int:pk>/',    product_group_detail, name='product-group-detail'),
    path('semi-finished-products/', semi_finished_product_list, name='semi-finished-product-list'),
    path('semi-finished-products/<int:pk>/', semi_finished_product_detail, name='semi-finished-product-detail'),
    path('order-requests/', order_request_list, name='order-request-list'),
    path('order-requests/<int:pk>/', order_request_detail, name='order-request-detail'),
    path('production-plans/', production_plan_list, name='production-plan-list'),
    path('production-plans/<int:pk>/', production_plan_detail, name='production-plan-detail'),
    path('production-requests/', order_request_list, name='production-request-list'),
    path('production-requests/<int:pk>/', order_request_detail, name='production-request-detail'),
    path('production-orders/', production_order_list, name='production-order-list'),
    path('production-orders/<int:pk>/', production_order_detail, name='production-order-detail'),
    path('production-acceptances/', production_acceptance_list, name='production-acceptance-list'),
    path('production-acceptances/<int:pk>/', production_acceptance_detail, name='production-acceptance-detail'),

    # ─── Sản xuất > Nguyên vật liệu ───────────────────────────────────────────
    path('raw-materials/', raw_material_list, name='raw-material-list'),
    path('material-groups/', material_group_list, name='material-group-list'),
    path('material-groups/<int:pk>/', material_group_detail, name='material-group-detail'),
    path('materials/',          material_list,   name='material-list'),
    path('materials/<int:pk>/', material_detail, name='material-detail'),
    path('suppliers/', supplier_list, name='supplier-list'),
    path('suppliers/<int:pk>/', supplier_detail, name='supplier-detail'),
    path('purchase-orders/',          purchase_order_list,   name='purchase-order-list'),
    path('purchase-orders/<int:pk>/', purchase_order_detail, name='purchase-order-detail'),

    # ─── Sản xuất > Khu vực BTP ───────────────────────────────────────────────
    path('semi-finished/inventory/', semi_finished_inventory, name='semi-finished-inventory'),
    path('semi-finished/receipts/', semi_finished_receipt, name='semi-finished-receipt'),
    path('semi-finished/issues/', semi_finished_issue, name='semi-finished-issue'),
    path('semi-finished/packaging-handover/', packaging_handover, name='packaging-handover'),
    path('semi-finished/packaging-record/', packaging_record, name='packaging-record'),

    # ─── Bán hàng > Khách hàng ────────────────────────────────────────────────
    path('customer-groups/',          customer_group_list,   name='customer-group-list'),
    path('customer-groups/<int:pk>/', customer_group_detail, name='customer-group-detail'),
    path('customers/',                customer_list,         name='customer-list'),
    path('customers/<int:pk>/',       customer_detail,       name='customer-detail'),

    # ─── Bán hàng > Đơn hàng ──────────────────────────────────────────────────
    path('orders/', order_list, name='order-list'),

    # ─── Nhân sự > Thiết lập nhân viên ────────────────────────────────────────
    path('employees/',              employee_list,         name='employee-list'),
    path('employees/bulk-delete/',  employee_bulk_delete,  name='employee-bulk-delete'),
    path('employees/<int:pk>/',     employee_detail,       name='employee-detail'),
    path('employee-roles/', employee_role_list, name='employee-role-list'),
    path('employee-accounts/', employee_account_list, name='employee-account-list'),
    
    # ─── Địa lý Việt Nam ──────────────────────────────────────────────────────
    path('provinces/', province_list, name='province-list'),
    path('districts/', district_list, name='district-list'),
    path('wards/', ward_list, name='ward-list'),
    
    # ─── Lương & Phúc lợi ─────────────────────────────────────────────────────
    path('salary-types/', salary_type_list, name='salary-type-list'),
    path('benefits-policies/', benefits_policy_list, name='benefits-policy-list'),

    # ─── Nhân sự > Quản lý chấm công ──────────────────────────────────────────
    path('shifts/',               shift_list,         name='shift-list'),
    path('shifts/bulk-delete/',   shift_bulk_delete,  name='shift-bulk-delete'),
    path('shifts/<int:pk>/',      shift_detail,       name='shift-detail'),
    path('schedules/',                schedule_list,          name='schedule-list'),
    path('schedules/bulk-delete/',    schedule_bulk_delete,   name='schedule-bulk-delete'),
    path('schedules/<int:pk>/',       schedule_detail,        name='schedule-detail'),
    path('attendances/',              attendance_list,        name='attendance-list'),
    path('attendances/bulk-delete/',  attendance_bulk_delete, name='attendance-bulk-delete'),
    path('attendances/<int:pk>/',     attendance_detail,      name='attendance-detail'),

    # ─── Nhân sự > Quản lý lương ──────────────────────────────────────────────
    path('bonuses/',               bonus_list,         name='bonus-list'),
    path('bonuses/bulk-delete/',   bonus_bulk_delete,  name='bonus-bulk-delete'),
    path('bonuses/<int:pk>/',      bonus_detail,       name='bonus-detail'),
    path('benefits/',               benefit_list,        name='benefit-list'),
    path('benefits/bulk-delete/',   benefit_bulk_delete, name='benefit-bulk-delete'),
    path('benefits/<int:pk>/',      benefit_detail,      name='benefit-detail'),
    path('payrolls/',               payroll_list,         name='payroll-list'),
    path('payrolls/bulk-delete/',   payroll_bulk_delete,  name='payroll-bulk-delete'),
    path('payrolls/<int:pk>/',      payroll_detail,       name='payroll-detail'),

    # ─── Tài chính ────────────────────────────────────────────────────────────
    path('fund-sources/', fund_source_list, name='fund-source-list'),
    path('cash-books/', cash_book_list, name='cash-book-list'),
    path('supplier-debts/', supplier_debt_list, name='supplier-debt-list'),
    path('customer-debts/', customer_debt_list, name='customer-debt-list'),

    # ─── Cài đặt ──────────────────────────────────────────────────────────────
    path('locations/',                  location_list,        name='location-list'),
    path('locations/bulk-delete/',      location_bulk_delete, name='location-bulk-delete'),
    path('locations/<int:pk>/',         location_detail,      name='location-detail'),
    path('staff-users/',                staff_user_list,      name='staff-user-list'),
    path('shipping-units/',             shipping_unit_list,        name='shipping-unit-list'),
    path('shipping-units/bulk-delete/', shipping_unit_bulk_delete, name='shipping-unit-bulk-delete'),
    path('shipping-units/<int:pk>/',    shipping_unit_detail,      name='shipping-unit-detail'),
]

