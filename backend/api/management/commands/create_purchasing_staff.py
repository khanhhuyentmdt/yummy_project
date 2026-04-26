"""
Seed purchasing staff account for ERP Yummy.

Usage:
    python manage.py create_purchasing_staff

Credentials:
    phone_number : 0982334556
    password     : 12345
    role         : Nhan vien thu mua
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Seed purchasing staff account for ERP Yummy'

    def handle(self, *args, **options):
        User  = get_user_model()
        phone = '0982334556'
        pwd   = '12345'
        role  = 'Nhân viên thu mua'

        if User.objects.filter(phone_number=phone).exists():
            self.stdout.write(self.style.WARNING(f'User {phone} already exists — skipped.'))
            return

        user = User.objects.create_user(
            phone_number=phone,
            password=pwd,
            full_name='Trần Minh Anh',
        )
        user.role = role
        user.save()
        self.stdout.write(self.style.SUCCESS(
            f'Created: {phone} / {pwd} | role: {role}'
        ))
