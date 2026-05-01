from django.core.management.base import BaseCommand
from api.models import WorkSchedule, WorkScheduleHistory, Employee, WorkShift
import datetime


class Command(BaseCommand):
    help = 'Seed sample work schedules'

    def handle(self, *args, **options):
        employees = list(Employee.objects.filter(status='working')[:5])
        shifts    = list(WorkShift.objects.filter(status='active')[:3])

        if not employees:
            self.stdout.write('No working employees found. Run seed_employees first.')
            return
        if not shifts:
            self.stdout.write('No active shifts found. Run seed_workshift first.')
            return

        samples = [
            dict(employee=employees[0], work_shift=shifts[0] if shifts else None,
                 start_date=datetime.date(2026, 5, 1), end_date=datetime.date(2026, 5, 31),
                 repeat_type='weekly', days_of_week='1,2,3,4,5', status='active'),
            dict(employee=employees[1] if len(employees) > 1 else employees[0],
                 work_shift=shifts[1] if len(shifts) > 1 else shifts[0],
                 start_date=datetime.date(2026, 5, 1), end_date=None,
                 repeat_type='once', days_of_week='', status='active'),
            dict(employee=employees[2] if len(employees) > 2 else employees[0],
                 work_shift=shifts[0] if shifts else None,
                 start_date=datetime.date(2026, 5, 6), end_date=datetime.date(2026, 5, 31),
                 repeat_type='weekly', days_of_week='1,2,3,4,5,6', status='active'),
        ]

        created = 0
        for i, s in enumerate(samples, 1):
            code = f'LLV{i:03d}'
            if WorkSchedule.objects.filter(code=code).exists():
                self.stdout.write(f'Skip {code} (exists)')
                continue
            sched = WorkSchedule.objects.create(code=code, created_by_name='seed', **s)
            WorkScheduleHistory.objects.create(
                schedule=sched, actor_name='seed', action=f'Tao moi lich lam viec {code}',
            )
            created += 1

        self.stdout.write(f'Seeded {created} work schedules.')
