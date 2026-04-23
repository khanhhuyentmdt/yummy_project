"""
python manage.py seed_materials
Seed bang Material voi 10 nguyen vat lieu mau cho quan tra sua / cafe.
"""
from django.core.management.base import BaseCommand
from api.models import Material

MATERIALS = [
    {'code': 'NVL001', 'name': 'Bot dau nanh',           'group': 'Do kho',      'unit': 'kilogram', 'status': 'active'},
    {'code': 'NVL002', 'name': 'Duong trang',             'group': 'Do kho',      'unit': 'kilogram', 'status': 'active'},
    {'code': 'NVL003', 'name': 'Sua dac co duong',        'group': 'Sua',         'unit': 'hop',      'status': 'active'},
    {'code': 'NVL004', 'name': 'Bot matcha Nhat',         'group': 'Do kho',      'unit': 'gram',     'status': 'active'},
    {'code': 'NVL005', 'name': 'Tran chau den',           'group': 'Phu gia',     'unit': 'kilogram', 'status': 'active'},
    {'code': 'NVL006', 'name': 'Bot Matcha nguyen chat',  'group': 'Do kho',      'unit': 'gram',     'status': 'inactive'},
    {'code': 'NVL007', 'name': 'Ly nhua 700ml',           'group': 'Bao bi',      'unit': 'cai',      'status': 'active'},
    {'code': 'NVL008', 'name': 'Khoai lang tim',          'group': 'Trai cay',    'unit': 'kilogram', 'status': 'inactive'},
    {'code': 'NVL009', 'name': 'Sua tuoi khong duong',    'group': 'Sua',         'unit': 'lit',      'status': 'active'},
    {'code': 'NVL010', 'name': 'Bot tau hu Singapore',    'group': 'Do kho',      'unit': 'kilogram', 'status': 'active'},
]


class Command(BaseCommand):
    help = 'Seed Material table with 10 sample records'

    def handle(self, *args, **options):
        created = 0
        skipped = 0
        for item in MATERIALS:
            _, is_new = Material.objects.get_or_create(
                code=item['code'],
                defaults={
                    'name':   item['name'],
                    'group':  item['group'],
                    'unit':   item['unit'],
                    'status': item['status'],
                },
            )
            if is_new:
                created += 1
            else:
                skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Done: {created} created, {skipped} already exist.'
            )
        )
