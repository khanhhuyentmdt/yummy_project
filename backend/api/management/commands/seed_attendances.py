from django.core.management.base import BaseCommand
from api.models import Attendance, AttendanceHistory, Employee, WorkShift
import datetime


class Command(BaseCommand):
    help = 'Seed sample attendance records'

    def handle(self, *args, **options):
        employees = list(Employee.objects.filter(status='working')[:5])
        shifts    = list(WorkShift.objects.filter(status='active')[:2])

        if not employees:
            self.stdout.write('No working employees found.')
            return

        base_date = datetime.date(2026, 4, 28)
        statuses  = ['present', 'present', 'late', 'absent', 'present']
        samples = []
        for i, emp in enumerate(employees[:5]):
            samples.append(dict(
                employee=emp,
                work_shift=shifts[i % len(shifts)] if shifts else None,
                attendance_date=base_date + datetime.timedelta(days=i),
                check_in_time=datetime.time(8, 5 + i * 3) if statuses[i] != 'absent' else None,
                check_out_time=datetime.time(17, 0) if statuses[i] != 'absent' else None,
                status=statuses[i],
                overtime_minutes=30 if i % 3 == 0 else 0,
            ))

        created = 0
        for i, s in enumerate(samples, 1):
            code = f'CC{i:03d}'
            if Attendance.objects.filter(code=code).exists():
                self.stdout.write(f'Skip {code} (exists)')
                continue
            emp = s.pop('employee')
            shift = s.pop('work_shift')
            try:
                att = Attendance.objects.create(
                    code=code, employee=emp, work_shift=shift, created_by_name='seed', **s
                )
                AttendanceHistory.objects.create(
                    attendance=att, actor_name='seed', action=f'Tao moi ban ghi cham cong {code}',
                )
                created += 1
            except Exception as e:
                self.stdout.write(f'Error creating {code}: {e}')

        self.stdout.write(f'Seeded {created} attendance records.')
