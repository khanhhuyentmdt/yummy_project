from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date
from api.models import Bonus, BonusHistory


SAMPLE_BONUSES = [
    {
        'code': 'MTH001',
        'reason': 'Sang kien Cong thuc',
        'bonus_date': date(2025, 1, 25),
        'total_amount': 1000000,
        'recipient_type': 'all',
        'employee_count': 10,
        'bonus_type': 'direct',
        'status': 'da_thanh_toan',
        'notes': '',
    },
    {
        'code': 'MTH002',
        'reason': 'Thuong Ve sinh (5S)',
        'bonus_date': date(2025, 1, 30),
        'total_amount': 500000,
        'recipient_type': 'custom',
        'employee_count': 5,
        'bonus_type': 'salary_addition',
        'status': 'chua_thanh_toan',
        'notes': 'Thuong cho to ve sinh thang 1',
    },
    {
        'code': 'MTH003',
        'reason': 'Thuong tham nien',
        'bonus_date': date(2025, 2, 5),
        'total_amount': 2000000,
        'recipient_type': 'custom',
        'employee_count': 5,
        'bonus_type': 'direct',
        'status': 'da_huy',
        'notes': 'Huy do ngan sach',
    },
    {
        'code': 'MTH004',
        'reason': 'Thuong Nang suat Bep',
        'bonus_date': date(2025, 2, 5),
        'total_amount': 300000,
        'recipient_type': 'all',
        'employee_count': 10,
        'bonus_type': 'salary_addition',
        'status': 'chua_thanh_toan',
        'notes': '',
    },
]


class Command(BaseCommand):
    help = 'Seed sample bonus data'

    def handle(self, *args, **options):
        created = 0
        for data in SAMPLE_BONUSES:
            bonus, is_new = Bonus.objects.get_or_create(
                code=data['code'],
                defaults={
                    'reason': data['reason'],
                    'bonus_date': data['bonus_date'],
                    'total_amount': data['total_amount'],
                    'recipient_type': data['recipient_type'],
                    'employee_count': data['employee_count'],
                    'bonus_type': data['bonus_type'],
                    'status': data['status'],
                    'notes': data['notes'],
                    'created_by_name': 'System',
                },
            )
            if is_new:
                BonusHistory.objects.create(
                    bonus=bonus,
                    actor_name='System',
                    action=f'Tao moi thuong {bonus.code}',
                )
                created += 1

        self.stdout.write(f'Seeded {created} bonuses (skipped existing).')
