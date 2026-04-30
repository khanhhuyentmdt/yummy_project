"""
Thiết lập nhân viên views module
"""
from .employee_views import (
    employee_list,
    employee_detail,
    employee_bulk_delete,
    employee_role_list,
    employee_account_list,
)
from .location_views import (
    province_list,
    district_list,
    ward_list,
)
from .salary_benefits_views import (
    salary_type_list,
    benefits_policy_list,
)

__all__ = [
    'employee_list',
    'employee_detail',
    'employee_bulk_delete',
    'employee_role_list',
    'employee_account_list',
    'province_list',
    'district_list',
    'ward_list',
    'salary_type_list',
    'benefits_policy_list',
]
