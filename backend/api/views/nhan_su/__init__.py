"""
Nhân sự views module
"""
from .thiet_lap_nhan_vien import (
    employee_list,
    employee_detail,
    employee_bulk_delete,
    employee_role_list,
    employee_account_list,
    province_list,
    district_list,
    ward_list,
    salary_type_list,
    benefits_policy_list,
)
from .quan_ly_cham_cong import (
    shift_list,
    shift_detail,
    shift_bulk_delete,
    schedule_list,
    attendance_list,
)
from .quan_ly_luong import (
    bonus_list,
    bonus_detail,
    bonus_bulk_delete,
    benefit_list,
    benefit_detail,
    benefit_bulk_delete,
    payroll_list,
)

__all__ = [
    # Thiết lập nhân viên
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
    # Quản lý chấm công
    'shift_list',
    'shift_detail',
    'shift_bulk_delete',
    'schedule_list',
    'attendance_list',
    # Quản lý lương
    'bonus_list',
    'bonus_detail',
    'bonus_bulk_delete',
    'benefit_list',
    'benefit_detail',
    'benefit_bulk_delete',
    'payroll_list',
]
