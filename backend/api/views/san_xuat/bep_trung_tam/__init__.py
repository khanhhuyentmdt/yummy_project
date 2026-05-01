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
from .thong_tin_ban_thanh_pham import (
    semi_finished_product_list,
    semi_finished_product_detail,
)
from .van_hanh_san_xuat import (
    production_plan_list,
    production_plan_detail,
    order_request_list,
    order_request_detail,
    production_order_list,
    production_order_detail,
    production_acceptance_list,
    production_acceptance_detail,
)

__all__ = [
    'product_list',
    'product_detail',
    'product_sync',
    'product_group_list',
    'product_group_detail',
    'semi_finished_product_list',
    'semi_finished_product_detail',
    'order_request_list',
    'order_request_detail',
    'production_plan_list',
    'production_plan_detail',
    'production_order_list',
    'production_order_detail',
    'production_acceptance_list',
    'production_acceptance_detail',
]
