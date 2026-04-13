from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
    path('products/', views.product_list, name='product-list'),
]
