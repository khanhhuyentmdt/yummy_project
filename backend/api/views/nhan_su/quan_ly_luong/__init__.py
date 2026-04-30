"""
Quan ly luong views module
"""
from .bonus_views import bonus_list, bonus_detail, bonus_bulk_delete
from .payroll_views import benefit_list, payroll_list

__all__ = [
    'bonus_list',
    'bonus_detail',
    'bonus_bulk_delete',
    'benefit_list',
    'payroll_list',
]
