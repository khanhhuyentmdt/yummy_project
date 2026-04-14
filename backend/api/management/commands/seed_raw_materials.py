"""
python manage.py seed_raw_materials
Seed bang RawMaterial voi 12 nguyen lieu mau cho quan tra sua / cafe.
"""
from django.core.management.base import BaseCommand
from api.models import RawMaterial

RAW_MATERIALS = [
    {'code': 'NL001', 'name': 'Tra o long',          'unit': 'g'},
    {'code': 'NL002', 'name': 'Tra xanh',             'unit': 'g'},
    {'code': 'NL003', 'name': 'Duong trang',          'unit': 'g'},
    {'code': 'NL004', 'name': 'Duong den',            'unit': 'g'},
    {'code': 'NL005', 'name': 'Sua tuoi khong duong', 'unit': 'ml'},
    {'code': 'NL006', 'name': 'Sua dac',              'unit': 'ml'},
    {'code': 'NL007', 'name': 'Bot matcha Nhat',      'unit': 'g'},
    {'code': 'NL008', 'name': 'Bot khoai mon',        'unit': 'g'},
    {'code': 'NL009', 'name': 'Ca phe nguyen chat',   'unit': 'g'},
    {'code': 'NL010', 'name': 'Nuoc loc',             'unit': 'ml'},
    {'code': 'NL011', 'name': 'Da vien',              'unit': 'g'},
    {'code': 'NL012', 'name': 'Kem tuoi',             'unit': 'ml'},
]


class Command(BaseCommand):
    help = 'Seed RawMaterial table with sample data'

    def handle(self, *args, **options):
        created = 0
        skipped = 0
        for item in RAW_MATERIALS:
            _, is_new = RawMaterial.objects.get_or_create(
                code=item['code'],
                defaults={'name': item['name'], 'unit': item['unit']},
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
