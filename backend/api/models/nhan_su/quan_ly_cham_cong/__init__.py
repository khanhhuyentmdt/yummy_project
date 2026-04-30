from datetime import datetime, timedelta
from django.db import models


def time_to_minutes(time_obj):
    """Convert time object to minutes since midnight"""
    return time_obj.hour * 60 + time_obj.minute


def minutes_to_hours_display(total_minutes):
    """Convert minutes to display format: 'X giờ Y phút' or 'X.Y giờ'"""
    if total_minutes < 0:
        return "0 giờ"
    
    hours = total_minutes // 60
    minutes = total_minutes % 60
    
    if minutes == 0:
        return f"{hours} giờ"
    else:
        return f"{hours} giờ {minutes} phút"


def minutes_to_decimal_hours(total_minutes):
    """Convert minutes to decimal hours (e.g., 510 minutes = 8.5 hours)"""
    if total_minutes < 0:
        return 0.0
    return round(total_minutes / 60, 1)


class WorkShift(models.Model):
    STATUS_ACTIVE   = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES  = [
        (STATUS_ACTIVE,   'Dang hoat dong'),
        (STATUS_INACTIVE, 'Ngung hoat dong'),
    ]

    code       = models.CharField(max_length=20, unique=True, verbose_name='Ma ca lam viec')
    name       = models.CharField(max_length=200, verbose_name='Ten ca lam viec')
    start_time = models.TimeField(verbose_name='Gio bat dau')
    end_time   = models.TimeField(verbose_name='Gio ket thuc')
    status     = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE,
        verbose_name='Trang thai',
    )
    created_by_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi tao')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-id']
        verbose_name = 'WorkShift'

    def __str__(self):
        return f'{self.code} — {self.name}'

    def calculate_total_minutes(self):
        """
        Calculate total working minutes: (end_time - start_time) - total_break_minutes
        Handles overnight shifts correctly
        """
        # Convert times to minutes
        start_mins = time_to_minutes(self.start_time)
        end_mins = time_to_minutes(self.end_time)
        
        # Handle overnight shift (e.g., 22:00 to 06:00)
        if end_mins <= start_mins:
            end_mins += 24 * 60  # Add 24 hours in minutes
        
        # Calculate work duration
        work_mins = end_mins - start_mins
        
        # Subtract break times
        total_break_mins = 0
        for brk in self.breaks.all():
            break_start_mins = time_to_minutes(brk.break_start)
            break_end_mins = time_to_minutes(brk.break_end)
            
            # Handle overnight break
            if break_end_mins <= break_start_mins:
                break_end_mins += 24 * 60
            
            total_break_mins += (break_end_mins - break_start_mins)
        
        return work_mins - total_break_mins

    @property
    def total_hours(self):
        """Return total hours as decimal (e.g., 8.5)"""
        return minutes_to_decimal_hours(self.calculate_total_minutes())
    
    @property
    def total_hours_display(self):
        """Return total hours as display string (e.g., '8 giờ 30 phút')"""
        return minutes_to_hours_display(self.calculate_total_minutes())


class WorkShiftBreak(models.Model):
    shift       = models.ForeignKey(
        WorkShift, on_delete=models.CASCADE, related_name='breaks',
        verbose_name='Ca lam viec',
    )
    break_start = models.TimeField(verbose_name='Gio bat dau nghi')
    break_end   = models.TimeField(verbose_name='Gio ket thuc nghi')

    class Meta:
        ordering     = ['break_start']
        verbose_name = 'WorkShiftBreak'

    def __str__(self):
        return f'{self.shift.code} break {self.break_start}–{self.break_end}'


class WorkShiftHistory(models.Model):
    shift      = models.ForeignKey(
        WorkShift, on_delete=models.CASCADE, related_name='history',
        verbose_name='Ca lam viec',
    )
    timestamp  = models.DateTimeField(auto_now_add=True)
    actor_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi thuc hien')
    action     = models.CharField(max_length=300, verbose_name='Hanh dong')
    field_name = models.CharField(max_length=100, blank=True, verbose_name='Ten truong')
    old_value  = models.TextField(blank=True, verbose_name='Gia tri cu')
    new_value  = models.TextField(blank=True, verbose_name='Gia tri moi')

    class Meta:
        ordering     = ['-timestamp']
        verbose_name = 'WorkShiftHistory'

    def __str__(self):
        return f'{self.shift.code} — {self.action}'


__all__ = ['WorkShift', 'WorkShiftBreak', 'WorkShiftHistory', 'time_to_minutes', 'minutes_to_hours_display', 'minutes_to_decimal_hours']
