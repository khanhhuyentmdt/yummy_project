"""
Management command: seed_locations
Seed 5 dia diem mau vao DB.
"""
from django.core.management.base import BaseCommand
from api.models import Location


LOCATIONS = [
    {
        'code': 'MDD001',
        'name': 'Cua hang Ngu Hanh Son',
        'address': '120 Nguyen Duy Hieu, Ngu Hanh Son, Da Nang',
        'phone': '0236 123 4567',
        'status': 'inactive',
    },
    {
        'code': 'MDD002',
        'name': 'Khu vuc ban thanh pham',
        'address': '45 Le Duan, Hai Chau, Da Nang',
        'phone': '0236 234 5678',
        'status': 'active',
    },
    {
        'code': 'MDD003',
        'name': 'Khu vuc bep',
        'address': '45 Le Duan, Hai Chau, Da Nang',
        'phone': '0236 345 6789',
        'status': 'active',
    },
    {
        'code': 'MDD004',
        'name': 'Khu vuc nguyen vat lieu',
        'address': '45 Le Duan, Hai Chau, Da Nang',
        'phone': '0236 456 7890',
        'status': 'active',
    },
    {
        'code': 'MDD005',
        'name': 'Cua hang Van Don',
        'address': '88 Van Don, Son Tra, Da Nang',
        'phone': '0236 567 8901',
        'status': 'active',
    },
]


class Command(BaseCommand):
    help = 'Seed sample locations'

    def handle(self, *args, **options):
        created = 0
        updated = 0
        for data in LOCATIONS:
            obj, is_new = Location.objects.update_or_create(
                code=data['code'],
                defaults={k: v for k, v in data.items() if k != 'code'},
            )
            if is_new:
                created += 1
            else:
                updated += 1
        self.stdout.write(f'Done: {created} created, {updated} updated.')
