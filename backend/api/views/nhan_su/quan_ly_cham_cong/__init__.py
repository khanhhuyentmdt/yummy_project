"""
Quản lý chấm công views module
"""
from .shift_views import shift_list, shift_detail, shift_bulk_delete
from .attendance_views import schedule_list, attendance_list

__all__ = [
    'shift_list',
    'shift_detail',
    'shift_bulk_delete',
    'schedule_list',
    'attendance_list',
]
