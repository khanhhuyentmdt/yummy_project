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

    # Customers
    path('customers/', views.customer_list, name='customer-list'),

    # Orders
    path('orders/', views.order_list, name='order-list'),
]
