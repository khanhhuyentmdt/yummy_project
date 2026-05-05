"""
Seed MaterialInventory — one record per Material with varied statuses.
Run: python manage.py seed_material_inventory
"""
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Material, MaterialInventory


class Command(BaseCommand):
    help = 'Seed material inventory records'

    def handle(self, *args, **options):
        materials = list(Material.objects.all())
        if not materials:
            self.stdout.write('No materials found. Run seed_materials first.')
            return

        today = timezone.now().date()
        created = 0
        updated = 0

        # Build varied scenario data indexed by position
        scenarios = [
            # (quantity, min_quantity, near_expiry_days, expiry_offset_days, unit_cost)
            (0,  5,  14, 30,   45000),   # Hết hàng
            (2,  5,  14, 200,  32000),   # Sắp hết hàng
            (1,  5,  14, 10,   18000),   # Cận date (còn 10 ngày)
            (0,  5,  14, -5,   28000),   # Hết hạn (quá hạn 5 ngày)
            (20, 5,  14, 180,  55000),   # Còn hàng
            (15, 5,  14, 90,   22000),   # Còn hàng
            (3,  5,  14, 8,    67000),   # Cận date
            (50, 10, 14, 365,  12000),   # Còn hàng
            (4,  5,  14, 250,  38000),   # Sắp hết hàng
            (30, 5,  14, 60,   91000),   # Còn hàng
        ]

        for i, material in enumerate(materials):
            qty, min_qty, near_days, expiry_offset, unit_cost = scenarios[i % len(scenarios)]
            expiry = today + timedelta(days=expiry_offset) if expiry_offset is not None else None

            inv, was_created = MaterialInventory.objects.update_or_create(
                material=material,
                defaults={
                    'quantity':         qty,
                    'min_quantity':     min_qty,
                    'near_expiry_days': near_days,
                    'expiry_date':      expiry,
                    'unit_cost':        unit_cost,
                    'last_updated':     timezone.now(),
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Done: {created} created, {updated} updated ({created + updated} total)'
            )
        )
