"""
Quản lý chấm công views module
"""
from .shift_views import shift_list, shift_detail, shift_bulk_delete
from .attendance_views import (
    schedule_list, schedule_detail, schedule_bulk_delete,
    attendance_list, attendance_detail, attendance_bulk_delete,
)

__all__ = [
    'shift_list',
    'shift_detail',
    'shift_bulk_delete',
    'schedule_list',
    'schedule_detail',
    'schedule_bulk_delete',
    'attendance_list',
    'attendance_detail',
    'attendance_bulk_delete',
]
