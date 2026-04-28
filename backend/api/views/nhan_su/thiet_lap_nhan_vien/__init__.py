"""
Thiết lập nhân viên views module
"""
from .employee_views import (
    employee_list,
    employee_role_list,
    employee_account_list,
)

__all__ = [
    'employee_list',
    'employee_role_list',
    'employee_account_list',
]
