"""
Bán hàng views module
"""
from .khach_hang import (
    customer_group_list,
    customer_group_detail,
    customer_list,
    customer_detail,
)
from .order_views import order_list

__all__ = [
    'customer_group_list',
    'customer_group_detail',
    'customer_list',
    'customer_detail',
    'order_list',
]
