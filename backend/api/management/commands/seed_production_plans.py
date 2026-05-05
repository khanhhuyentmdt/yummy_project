"""
Seed production plans for testing.

Usage:
    python manage.py seed_production_plans
"""
from django.core.management.base import BaseCommand
from api.models import ProductionPlan, ProductionPlanItem, SemiFinishedProduct
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Seed production plans for testing'

    def handle(self, *args, **options):
        # Check if we have semi-finished products
        sfp_count = SemiFinishedProduct.objects.count()
        if sfp_count == 0:
            self.stdout.write(self.style.WARNING('No semi-finished products found. Please seed them first.'))
            return

        # Create sample plans (don't delete existing ones to avoid schema issues)
        today = date.today()
        
        plans_data = [
            {
                'code': 'KH001',
                'name': 'Kế hoạch sản xuất tháng 5',
                'start_date': today,
                'end_date': today + timedelta(days=30),
                'status': 'pending',
                'notes': 'Kế hoạch sản xuất cho tháng 5/2026',
            },
            {
                'code': 'KH002',
                'name': 'Kế hoạch sản xuất tuần 1',
                'start_date': today,
                'end_date': today + timedelta(days=7),
                'status': 'draft',
                'notes': 'Kế hoạch sản xuất tuần đầu tiên',
            },
            {
                'code': 'KH003',
                'name': 'Kế hoạch sản xuất đặc biệt',
                'start_date': today + timedelta(days=7),
                'end_date': today + timedelta(days=14),
                'status': 'sent',
                'notes': 'Đơn hàng đặc biệt cho khách hàng VIP',
            },
        ]

        for plan_data in plans_data:
            # Skip if already exists
            if ProductionPlan.objects.filter(code=plan_data['code']).exists():
                self.stdout.write(self.style.WARNING(f'Plan {plan_data["code"]} already exists - skipped'))
                continue
                
            plan = ProductionPlan.objects.create(**plan_data)
            
            # Add some items
            sfps = SemiFinishedProduct.objects.all()[:3]
            for i, sfp in enumerate(sfps, 1):
                ProductionPlanItem.objects.create(
                    production_plan=plan,
                    semi_finished_product=sfp,
                    quantity=100 * i,
                    duration_minutes=60 * i,
                )
            
            self.stdout.write(self.style.SUCCESS(f'Created plan: {plan.code} with {len(sfps)} items'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded production plans!'))
