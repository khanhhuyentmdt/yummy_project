"""
python manage.py seed_products
Seed 11 san pham mau vao bang Product.
"""
from django.core.management.base import BaseCommand
from api.models import Product

PRODUCTS = [
    {'code': 'HSP011', 'name': 'Tra ho Khoai mon 3 vi',          'group': 'Tra ho Singapore', 'unit': 'Ly',   'price': 28000, 'status': 'active'},
    {'code': 'HSP022', 'name': 'Matcha tra ho gao rang dac 49',   'group': 'Matcha Tra ho',    'unit': 'Ly',   'price': 30000, 'status': 'inactive'},
    {'code': 'HSP030', 'name': 'Tra ho kem tam Duong dem',        'group': 'Tra ho Singapore', 'unit': 'Phan', 'price': 32000, 'status': 'active'},
    {'code': 'HSP045', 'name': 'Tra ho Duong trang',              'group': 'Tra ho Singapore', 'unit': 'Phan', 'price': 22000, 'status': 'active'},
    {'code': 'HSP056', 'name': 'Tra ho sua xuat',                 'group': 'Tra ho Singapore', 'unit': 'Phan', 'price': 30000, 'status': 'inactive'},
    {'code': 'HSP067', 'name': 'Tra xanh hoa nhai',               'group': 'Tra ho Singapore', 'unit': 'Ly',   'price': 25000, 'status': 'active'},
    {'code': 'HSP078', 'name': 'Tra o long sua tuoi',             'group': 'Tra ho Singapore', 'unit': 'Ly',   'price': 35000, 'status': 'active'},
    {'code': 'HSP089', 'name': 'Matcha latte nong',               'group': 'Matcha Tra ho',    'unit': 'Ly',   'price': 38000, 'status': 'active'},
    {'code': 'HSP090', 'name': 'Tra dao cam sa',                  'group': 'Tra ho Singapore', 'unit': 'Ly',   'price': 29000, 'status': 'inactive'},
    {'code': 'HSP101', 'name': 'Tra vai thieu',                   'group': 'Tra ho Singapore', 'unit': 'Ly',   'price': 27000, 'status': 'active'},
    {'code': 'HSP112', 'name': 'Ca phe muoi',                     'group': 'Ca phe',           'unit': 'Ly',   'price': 33000, 'status': 'active'},
]


class Command(BaseCommand):
    help = 'Seed 11 san pham mau vao DB'

    def handle(self, *args, **options):
        created = 0
        skipped = 0
        for data in PRODUCTS:
            _, is_new = Product.objects.get_or_create(
                code=data['code'],
                defaults=data,
            )
            if is_new:
                created += 1
            else:
                skipped += 1

        self.stdout.write(
            f'Done. Created: {created}, already existed (skipped): {skipped}.'
        )
