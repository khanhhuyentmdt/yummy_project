from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering       = ('phone_number',)
    list_display   = ('phone_number', 'full_name', 'is_staff', 'is_active')
    search_fields  = ('phone_number', 'full_name')
    filter_horizontal = ('groups', 'user_permissions')

    fieldsets = (
        (None,          {'fields': ('phone_number', 'password')}),
        ('Info',        {'fields': ('full_name', 'email', 'first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser',
                                    'groups', 'user_permissions')}),
        ('Dates',       {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('phone_number', 'full_name', 'password1', 'password2'),
        }),
    )
