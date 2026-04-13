from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.PhoneLoginView.as_view(), name='login'),

    # Dashboard
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),

    # Products
    path('products/', views.product_list, name='product-list'),
]
