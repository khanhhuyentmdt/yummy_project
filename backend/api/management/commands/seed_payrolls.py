from django.core.management.base import BaseCommand
from api.models import Payroll, PayrollEmployee, PayrollHistory, Employee


class Command(BaseCommand):
    help = 'Seed payroll sample data'

    def handle(self, *args, **options):
        if Payroll.objects.exists():
            self.stdout.write('Payroll data already exists. Skipping.')
            return

        employees = list(Employee.objects.filter(status='working').order_by('id')[:5])
        if not employees:
            self.stdout.write('No active employees found. Run seed_employees first.')
            return

        records = [
            {
                'code': 'MBL001',
                'name': 'Bang luong thang 1/2026',
                'period': '01/2026',
                'scope': 'all',
                'status': 'paying',
                'notes': '',
            },
            {
                'code': 'MBL002',
                'name': 'Bang luong bo phan nhan su thang 2/2026',
                'period': '01/2026',
                'scope': 'selected',
                'status': 'draft',
                'notes': '',
            },
            {
                'code': 'MBL003',
                'name': 'Bang luong nhan vien cua hang thang 2/2026',
                'period': '02/2026',
                'scope': 'selected',
                'status': 'draft',
                'notes': '',
            },
            {
                'code': 'MBL004',
                'name': 'Bang luong bo phan bep thang 2/2026',
                'period': '02/2026',
                'scope': 'all',
                'status': 'cancelled',
                'notes': '',
            },
            {
                'code': 'MBL005',
                'name': 'Bang luong bo phan kho thang 2/2026',
                'period': '02/2026',
                'scope': 'selected',
                'status': 'paid',
                'notes': '',
            },
        ]

        for rec in records:
            payroll = Payroll.objects.create(
                code=rec['code'],
                name=rec['name'],
                period=rec['period'],
                scope=rec['scope'],
                status=rec['status'],
                notes=rec['notes'],
                created_by_name='Admin',
            )

            total = 0
            emp_subset = employees[:2] if rec['scope'] == 'selected' else employees
            for emp in emp_subset:
                base = int(emp.salary_amount or 7000000)
                benefit = int(emp.salary_allowance or 500000)
                net = base + benefit
                pstatus = 'paid' if payroll.status == 'paid' else 'unpaid'
                PayrollEmployee.objects.create(
                    payroll=payroll,
                    employee=emp,
                    base_salary=base,
                    work_days=25,
                    bonus_amount=0,
                    benefit_amount=benefit,
                    net_salary=net,
                    payment_status=pstatus,
                )
                total += net

            paid = total if payroll.status == 'paid' else 0
            if payroll.status == 'paying':
                paid = total // 2

            payroll.total_amount = total
            payroll.paid_amount = paid
            payroll.save()

            PayrollHistory.objects.create(
                payroll=payroll,
                actor_name='Admin',
                action=f'Tao moi bang luong {payroll.code}',
            )

        self.stdout.write(f'Seeded {len(records)} payroll records.')
