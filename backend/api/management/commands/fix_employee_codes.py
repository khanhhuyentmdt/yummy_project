"""
Management command to fix employee codes to sequential format MNV001, MNV002, etc.
Run: python manage.py fix_employee_codes
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import Employee


class Command(BaseCommand):
    help = 'Fix employee codes to sequential format MNV001, MNV002, MNV003...'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Starting to fix employee codes...'))
        
        # Get all employees ordered by ID (creation order)
        employees = Employee.objects.all().order_by('id')
        total = employees.count()
        
        if total == 0:
            self.stdout.write(self.style.WARNING('No employees found.'))
            return
        
        self.stdout.write(f'Found {total} employees to update.')
        
        with transaction.atomic():
            # Step 1: Set all codes to temporary values to avoid conflicts
            self.stdout.write('\nStep 1: Setting temporary codes...')
            for employee in employees:
                old_code = employee.code
                temp_code = f'TEMP_{employee.id}'
                employee.code = temp_code
                employee.save(update_fields=['code'])
                self.stdout.write(f'  - {old_code} → {temp_code}')
            
            # Step 2: Set final sequential codes
            self.stdout.write('\nStep 2: Setting final sequential codes...')
            employees = Employee.objects.all().order_by('id')
            for index, employee in enumerate(employees, start=1):
                temp_code = employee.code
                new_code = f'MNV{index:03d}'
                employee.code = new_code
                employee.save(update_fields=['code'])
                self.stdout.write(
                    self.style.SUCCESS(f'  ✓ {temp_code} → {new_code} ({employee.full_name})')
                )
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Done! All {total} employees now have sequential codes.'))
        self.stdout.write(self.style.SUCCESS(f'Codes range: MNV001 to MNV{total:03d}'))

