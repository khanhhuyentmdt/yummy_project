"""
Seed sample suppliers and purchase orders for ERP Yummy.

Usage:
    python manage.py seed_purchase_orders
"""
from django.core.management.base import BaseCommand
from django.utils import timezone as tz
from datetime import datetime, timezone as dt_tz

from api.models import Supplier, PurchaseOrder


SUPPLIERS = [
    {'name': 'Tong kho Bot Thuc pham mien Trung', 'phone': '0236123456', 'address': 'Da Nang'},
    {'name': 'NPP Tra & Nguyen lieu pha che Loc Phat', 'phone': '0283456789', 'address': 'Ho Chi Minh'},
    {'name': 'Cong ty CP Sua Viet Nam (Vinamilk)', 'phone': '02838123456', 'address': 'Ho Chi Minh'},
    {'name': 'Thuc pham Dong lanh Hai Nam', 'phone': '0258765432', 'address': 'Khanh Hoa'},
    {'name': 'Xuong in & San xuat bao bi nhua', 'phone': '02866543210', 'address': 'Binh Duong'},
]

def _dt(year, month, day, hour, minute):
    return datetime(year, month, day, hour, minute, tzinfo=dt_tz.utc)

ORDERS = [
    {'code': 'PDH001', 'supplier_idx': 4, 'total_value': 800000,  'status': 'cancelled', 'created_at': _dt(2026, 2, 15, 1, 42)},
    {'code': 'PDH002', 'supplier_idx': 3, 'total_value': 3100000, 'status': 'draft',     'created_at': _dt(2026, 3,  1, 3,  3)},
    {'code': 'PDH003', 'supplier_idx': 2, 'total_value': 5400000, 'status': 'received',  'created_at': _dt(2026, 3, 14, 3,  3)},
    {'code': 'PDH004', 'supplier_idx': 1, 'total_value': 1200000, 'status': 'waiting',   'created_at': _dt(2026, 3, 14, 6, 31)},
    {'code': 'PDH005', 'supplier_idx': 0, 'total_value': 2500000, 'status': 'draft',     'created_at': _dt(2026, 3, 12, 3, 30)},
]


class Command(BaseCommand):
    help = 'Seed sample suppliers and purchase orders'

    def handle(self, *args, **options):
        suppliers = []
        for s in SUPPLIERS:
            obj, created = Supplier.objects.get_or_create(
                name=s['name'],
                defaults={'phone': s['phone'], 'address': s['address']},
            )
            suppliers.append(obj)
            if created:
                self.stdout.write(f'  Supplier created: {obj.name}')

        created_count = 0
        for o in ORDERS:
            if PurchaseOrder.objects.filter(code=o['code']).exists():
                continue
            po = PurchaseOrder(
                code=o['code'],
                supplier=suppliers[o['supplier_idx']],
                total_value=o['total_value'],
                status=o['status'],
            )
            po.save()
            PurchaseOrder.objects.filter(pk=po.pk).update(created_at=o['created_at'])
            created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done: {len(suppliers)} suppliers, {created_count} purchase orders created.'
        ))
