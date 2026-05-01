"""
Quan ly luong views module
"""
from .bonus_views import bonus_list, bonus_detail, bonus_bulk_delete
from .benefit_views import benefit_list, benefit_detail, benefit_bulk_delete
from .payroll_views import payroll_list, payroll_detail, payroll_bulk_delete

__all__ = [
    'bonus_list',
    'bonus_detail',
    'bonus_bulk_delete',
    'benefit_list',
    'benefit_detail',
    'benefit_bulk_delete',
    'payroll_list',
    'payroll_detail',
    'payroll_bulk_delete',
]
