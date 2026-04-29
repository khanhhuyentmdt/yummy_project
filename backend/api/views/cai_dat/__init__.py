"""
Cài đặt views module
"""
from .location_views import location_list, location_detail
from .settings_views import shipping_unit_list

__all__ = [
    'location_list',
    'location_detail',
    'shipping_unit_list',
]
