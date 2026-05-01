"""
Sản xuất views module
"""
from .bootstrap_views import production_defaults_bootstrap
from .bep_trung_tam import (
    product_list,
    product_detail,
    product_sync,
    product_group_list,
    product_group_detail,
    semi_finished_product_list,
    semi_finished_product_detail,
    order_request_list,
    order_request_detail,
    production_plan_list,
    production_plan_detail,
    production_order_list,
    production_order_detail,
    production_acceptance_list,
    production_acceptance_detail,
)
from .nguyen_vat_lieu import (
    material_list,
    material_detail,
    material_group_list,
    material_group_detail,
    raw_material_list,
    supplier_list,
    supplier_detail,
    purchase_order_list,
    purchase_order_detail,
)
from .khu_vuc_btp import (
    semi_finished_inventory,
    semi_finished_receipt,
    semi_finished_issue,
    packaging_handover,
    packaging_record,
)

__all__ = [
    'production_defaults_bootstrap',
    # Bếp trung tâm
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
    # Nguyên vật liệu
    'material_list',
    'material_detail',
    'material_group_list',
    'material_group_detail',
    'raw_material_list',
    'supplier_list',
    'supplier_detail',
    'purchase_order_list',
    'purchase_order_detail',
    # Khu vực BTP
    'semi_finished_inventory',
    'semi_finished_receipt',
    'semi_finished_issue',
    'packaging_handover',
    'packaging_record',
]
