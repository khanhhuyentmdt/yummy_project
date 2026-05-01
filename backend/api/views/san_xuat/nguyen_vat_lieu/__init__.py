"""
Nguyên vật liệu views module
"""
from .material_views import material_list, material_detail
from .material_group_views import material_group_list, material_group_detail
from .raw_material_views import raw_material_list
from .purchase_views import (
    supplier_list,
    supplier_detail,
    purchase_order_list,
    purchase_order_detail,
)

__all__ = [
    'material_list',
    'material_detail',
    'material_group_list',
    'material_group_detail',
    'raw_material_list',
    'supplier_list',
    'supplier_detail',
    'purchase_order_list',
    'purchase_order_detail',
]
