"""
Bếp trung tâm views module
"""
from .thong_tin_san_pham import (
    product_list,
    product_detail,
    product_sync,
    product_group_list,
    product_group_detail,
)

__all__ = [
    'product_list',
    'product_detail',
    'product_sync',
    'product_group_list',
    'product_group_detail',
]
