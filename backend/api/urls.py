from django.urls import path
from .views import (
    # Auth
    PhoneLoginView,
    # Tổng quan
    dashboard_stats,
    # Sản xuất - Bếp trung tâm
    product_list,
    product_detail,
    product_sync,
    # Sản xuất - Nguyên vật liệu
    material_list,
    material_detail,
    raw_material_list,
    supplier_list,
    purchase_order_list,
    purchase_order_detail,
    # Sản xuất - Khu vực BTP
    semi_finished_inventory,
    semi_finished_receipt,
    semi_finished_issue,
    packaging_handover,
    packaging_record,
    # Bán hàng
    customer_list,
    order_list,
    # Nhân sự
    employee_list,
    employee_role_list,
    employee_account_list,
    shift_list,
    schedule_list,
    attendance_list,
    bonus_list,
    benefit_list,
    payroll_list,
    # Tài chính
    fund_source_list,
    cash_book_list,
    supplier_debt_list,
    customer_debt_list,
    # Cài đặt
    location_list,
    shipping_unit_list,
)

urlpatterns = [
    # ─── Auth ─────────────────────────────────────────────────────────────────
    path('auth/login/', PhoneLoginView.as_view(), name='login'),

    # ─── Dashboard ────────────────────────────────────────────────────────────
    path('dashboard/', dashboard_stats, name='dashboard-stats'),

    # ─── Sản xuất > Bếp trung tâm > Sản phẩm ─────────────────────────────────
    path('products/',             product_list,   name='product-list'),
    path('products/sync/',        product_sync,   name='product-sync'),
    path('products/<int:pk>/',    product_detail, name='product-detail'),

    # ─── Sản xuất > Nguyên vật liệu ───────────────────────────────────────────
    path('raw-materials/', raw_material_list, name='raw-material-list'),
    path('materials/',          material_list,   name='material-list'),
    path('materials/<int:pk>/', material_detail, name='material-detail'),
    path('suppliers/', supplier_list, name='supplier-list'),
    path('purchase-orders/',          purchase_order_list,   name='purchase-order-list'),
    path('purchase-orders/<int:pk>/', purchase_order_detail, name='purchase-order-detail'),

    # ─── Sản xuất > Khu vực BTP ───────────────────────────────────────────────
    path('semi-finished/inventory/', semi_finished_inventory, name='semi-finished-inventory'),
    path('semi-finished/receipts/', semi_finished_receipt, name='semi-finished-receipt'),
    path('semi-finished/issues/', semi_finished_issue, name='semi-finished-issue'),
    path('semi-finished/packaging-handover/', packaging_handover, name='packaging-handover'),
    path('semi-finished/packaging-record/', packaging_record, name='packaging-record'),

    # ─── Bán hàng ─────────────────────────────────────────────────────────────
    path('customers/', customer_list, name='customer-list'),
    path('orders/', order_list, name='order-list'),

    # ─── Nhân sự > Thiết lập nhân viên ────────────────────────────────────────
    path('employees/', employee_list, name='employee-list'),
    path('employee-roles/', employee_role_list, name='employee-role-list'),
    path('employee-accounts/', employee_account_list, name='employee-account-list'),

    # ─── Nhân sự > Quản lý chấm công ──────────────────────────────────────────
    path('shifts/', shift_list, name='shift-list'),
    path('schedules/', schedule_list, name='schedule-list'),
    path('attendances/', attendance_list, name='attendance-list'),

    # ─── Nhân sự > Quản lý lương ──────────────────────────────────────────────
    path('bonuses/', bonus_list, name='bonus-list'),
    path('benefits/', benefit_list, name='benefit-list'),
    path('payrolls/', payroll_list, name='payroll-list'),

    # ─── Tài chính ────────────────────────────────────────────────────────────
    path('fund-sources/', fund_source_list, name='fund-source-list'),
    path('cash-books/', cash_book_list, name='cash-book-list'),
    path('supplier-debts/', supplier_debt_list, name='supplier-debt-list'),
    path('customer-debts/', customer_debt_list, name='customer-debt-list'),

    # ─── Cài đặt ──────────────────────────────────────────────────────────────
    path('locations/', location_list, name='location-list'),
    path('shipping-units/', shipping_unit_list, name='shipping-unit-list'),
]
