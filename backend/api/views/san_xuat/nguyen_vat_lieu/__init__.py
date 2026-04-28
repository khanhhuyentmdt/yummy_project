"""
Nguyên vật liệu views module
"""
from .material_views import material_list, material_detail
from .raw_material_views import raw_material_list
from .purchase_views import (
    supplier_list,
    purchase_order_list,
    purchase_order_detail,
)

__all__ = [
    'material_list',
    'material_detail',
    'raw_material_list',
    'supplier_list',
    'purchase_order_list',
    'purchase_order_detail',
]
