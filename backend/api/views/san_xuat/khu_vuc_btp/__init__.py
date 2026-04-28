"""
Khu vực BTP views module
"""
from .semi_finished_views import (
    semi_finished_inventory,
    semi_finished_receipt,
    semi_finished_issue,
    packaging_handover,
    packaging_record,
)

__all__ = [
    'semi_finished_inventory',
    'semi_finished_receipt',
    'semi_finished_issue',
    'packaging_handover',
    'packaging_record',
]
