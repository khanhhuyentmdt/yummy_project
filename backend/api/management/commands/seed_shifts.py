from django.core.management.base import BaseCommand
from api.models import WorkShift, WorkShiftBreak
from datetime import time


class Command(BaseCommand):
    help = 'Seed sample work shifts'

    def handle(self, *args, **options):
        self.stdout.write('Seeding work shifts...')
        
        # Clear existing shifts
        WorkShift.objects.all().delete()
        
        shifts_data = [
            {
                'code': 'CLV001',
                'name': 'Ca sáng',
                'start_time': time(8, 0),
                'end_time': time(17, 0),
                'status': 'active',
                'breaks': [
                    {'break_start': time(12, 0), 'break_end': time(13, 0)},
                ]
            },
            {
                'code': 'CLV002',
                'name': 'Ca chiều',
                'start_time': time(13, 0),
                'end_time': time(22, 0),
                'status': 'active',
                'breaks': [
                    {'break_start': time(17, 0), 'break_end': time(17, 30)},
                ]
            },
            {
                'code': 'CLV003',
                'name': 'Ca đêm',
                'start_time': time(22, 0),
                'end_time': time(6, 0),
                'status': 'active',
                'breaks': [
                    {'break_start': time(2, 0), 'break_end': time(2, 30)},
                ]
            },
            {
                'code': 'CLV004',
                'name': 'Ca hành chính',
                'start_time': time(8, 0),
                'end_time': time(17, 30),
                'status': 'active',
                'breaks': [
                    {'break_start': time(12, 0), 'break_end': time(13, 0)},
                ]
            },
        ]
        
        for shift_data in shifts_data:
            breaks = shift_data.pop('breaks', [])
            shift = WorkShift.objects.create(**shift_data)
            
            for break_data in breaks:
                WorkShiftBreak.objects.create(shift=shift, **break_data)
            
            self.stdout.write(self.style.SUCCESS(f'Created shift: {shift.code} - {shift.name}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'Successfully seeded {WorkShift.objects.count()} work shifts'
        ))
