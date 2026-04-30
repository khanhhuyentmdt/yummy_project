"""
Seed command: tao 10 nhan vien mau vao DB.
Usage: python manage.py seed_employees
"""
import random
from datetime import date
from django.core.management.base import BaseCommand
from api.models import Employee, Location


EMPLOYEES = [
    {'full_name': 'Tran Minh Anh',     'phone': '0982334556', 'role': 'Nhan vien thu mua',    'shift': 'Hanh chinh', 'start_date': date(2025, 2, 5)},
    {'full_name': 'Nguyen Thuy Minh',  'phone': '0352112233', 'role': 'Nhan vien dong goi',   'shift': 'Ca sang',    'start_date': date(2025, 1, 30)},
    {'full_name': 'Hoang Thu Trang',   'phone': '0917445667', 'role': 'Tro ly san xuat',      'shift': 'Ca chieu',   'start_date': date(2025, 1, 25)},
    {'full_name': 'Le Thi Hoa',        'phone': '0706554332', 'role': 'Nhan vien bep',        'shift': 'Ca sang',    'start_date': date(2025, 1, 20)},
    {'full_name': 'Bui Minh Triet',    'phone': '0909887766', 'role': 'Nhan vien tai chinh',  'shift': 'Hanh chinh', 'start_date': date(2025, 1, 15)},
    {'full_name': 'Pham Quoc Khanh',   'phone': '0938123456', 'role': 'Nhan vien kho',        'shift': 'Ca toi',     'start_date': date(2025, 1, 10)},
    {'full_name': 'Vo Thi Mai Linh',   'phone': '0775234567', 'role': 'Chuyen vien nhan su',  'shift': 'Hanh chinh', 'start_date': date(2024, 12, 15)},
    {'full_name': 'Dang Hoang Nam',    'phone': '0863456789', 'role': 'Tro ly nhan su',       'shift': 'Hanh chinh', 'start_date': date(2024, 12, 1)},
    {'full_name': 'Truong Kieu Oanh',  'phone': '0912345670', 'role': 'Nhan vien ban hang',   'shift': 'Ca sang',    'start_date': date(2024, 11, 20)},
    {'full_name': 'Nguyen Van Duc',    'phone': '0356789012', 'role': 'Nhan vien pha che',    'shift': 'Ca chieu',   'start_date': date(2024, 11, 5)},
]

STATUSES = ['working', 'working', 'working', 'stopped']


class Command(BaseCommand):
    help = 'Seed 10 employees into DB'

    def handle(self, *args, **options):
        locations = list(Location.objects.all())

        for i, data in enumerate(EMPLOYEES):
            code = f'MNV{(i + 1):06d}'
            if Employee.objects.filter(code=code).exists():
                self.stdout.write(f'  skip {code}')
                continue
            employee = Employee.objects.create(
                code=code,
                full_name=data['full_name'],
                phone=data['phone'],
                role=data['role'],
                shift=data['shift'],
                start_date=data['start_date'],
                work_area=random.choice(locations) if locations else None,
                status=random.choice(STATUSES),
                salary_base=random.choice([5000000, 6000000, 7000000, 8000000]),
                salary_allowance=random.choice([500000, 1000000, 1500000]),
                created_by_name='seed_employees',
            )
            self.stdout.write(f'  created {employee.code} — {employee.full_name}')

        self.stdout.write(self.style.SUCCESS('Done: seed_employees'))
