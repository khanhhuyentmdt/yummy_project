from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Customer, Order, Product, User


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


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display   = ('code', 'name', 'group', 'unit', 'price', 'status')
    list_filter    = ('status', 'group')
    search_fields  = ('code', 'name')
    ordering       = ('code',)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display  = ('name', 'phone', 'email', 'created_at')
    search_fields = ('name', 'phone')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ('code', 'customer', 'total', 'status', 'created_at')
    list_filter   = ('status',)
    search_fields = ('code',)
    raw_id_fields = ('customer',)
