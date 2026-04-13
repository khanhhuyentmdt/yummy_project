"""
Seed default admin account for ERP Yummy.

Usage:
    python manage.py create_test_user

Credentials:
    phone_number : 0915085900
    password     : 12345
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Seed default admin account for ERP Yummy'

    def handle(self, *args, **options):
        User  = get_user_model()
        phone = '0915085900'
        pwd   = '12345'

        if User.objects.filter(phone_number=phone).exists():
            self.stdout.write(self.style.WARNING(f'User {phone} already exists — skipped.'))
            return

        User.objects.create_superuser(
            phone_number=phone,
            password=pwd,
            full_name='Thao Vi',
        )
        self.stdout.write(self.style.SUCCESS(f'Created: {phone} / {pwd}'))
