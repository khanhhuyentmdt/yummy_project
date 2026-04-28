"""
Sản xuất views module
"""
from .bep_trung_tam import product_list, product_detail, product_sync
from .nguyen_vat_lieu import (
    material_list,
    material_detail,
    raw_material_list,
    supplier_list,
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
    # Bếp trung tâm
    'product_list',
    'product_detail',
    'product_sync',
    # Nguyên vật liệu
    'material_list',
    'material_detail',
    'raw_material_list',
    'supplier_list',
    'purchase_order_list',
    'purchase_order_detail',
    # Khu vực BTP
    'semi_finished_inventory',
    'semi_finished_receipt',
    'semi_finished_issue',
    'packaging_handover',
    'packaging_record',
]
