from .receipt_views import (
    warehouse_receipt_list,
    warehouse_receipt_detail,
    warehouse_receipt_bulk_delete,
)
from .inventory_views import (
    material_inventory_list,
    material_inventory_detail,
)

__all__ = [
    'warehouse_receipt_list',
    'warehouse_receipt_detail',
    'warehouse_receipt_bulk_delete',
    'material_inventory_list',
    'material_inventory_detail',
]
