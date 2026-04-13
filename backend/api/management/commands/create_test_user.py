"""
Management command: create default test account for ERP Yummy.

Usage:
    python manage.py create_test_user

Credentials:
    Phone (username): 0987654321
    Password:         yummy123
"""
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create default admin test account for ERP Yummy'

    def handle(self, *args, **options):
        phone = '0987654321'
        password = 'yummy123'

        if User.objects.filter(username=phone).exists():
            self.stdout.write(self.style.WARNING(f'User {phone} already exists — skipped.'))
            return

        User.objects.create_superuser(
            username=phone,
            password=password,
            email='admin@yummy.vn',
            first_name='Thao',
            last_name='Vi',
        )
        self.stdout.write(self.style.SUCCESS(f'Created user: {phone} / {password}'))
