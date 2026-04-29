"""
Cài đặt views module
"""
from .location_views import location_list, location_detail, location_bulk_delete, staff_user_list
from .shipping_unit_views import shipping_unit_list, shipping_unit_detail, shipping_unit_bulk_delete

__all__ = [
    'location_list',
    'location_detail',
    'location_bulk_delete',
    'staff_user_list',
    'shipping_unit_list',
    'shipping_unit_detail',
    'shipping_unit_bulk_delete',
]
