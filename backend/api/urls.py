from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.PhoneLoginView.as_view(), name='login'),

    # Dashboard
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),

    # Products
    path('products/',             views.product_list,   name='product-list'),
    path('products/sync/',        views.product_sync,   name='product-sync'),
    path('products/<int:pk>/',    views.product_detail, name='product-detail'),

    # Raw Materials (for BOM dropdown)
    path('raw-materials/', views.raw_material_list, name='raw-material-list'),

    # Materials (Nguyen vat lieu - full CRUD)
    path('materials/',          views.material_list,   name='material-list'),
    path('materials/<int:pk>/', views.material_detail, name='material-detail'),

    # Customers
    path('customers/', views.customer_list, name='customer-list'),

    # Orders
    path('orders/', views.order_list, name='order-list'),

    # Suppliers
    path('suppliers/', views.supplier_list, name='supplier-list'),

    # Purchase Orders
    path('purchase-orders/',          views.purchase_order_list,   name='purchase-order-list'),
    path('purchase-orders/<int:pk>/', views.purchase_order_detail, name='purchase-order-detail'),
]
