from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from api.models import WarehouseReceipt, WarehouseReceiptItem, WarehouseReceiptHistory, Supplier, Material


class Command(BaseCommand):
    help = 'Seed sample warehouse receipts (Phieu nhap kho)'

    def handle(self, *args, **options):
        if WarehouseReceipt.objects.exists():
            self.stdout.write('Warehouse receipts already exist. Skipping seed.')
            return

        suppliers = list(Supplier.objects.all()[:4])
        materials = list(Material.objects.all()[:6])

        if not suppliers:
            self.stdout.write('No suppliers found. Run seed_purchase_orders first.')
            return
        if not materials:
            self.stdout.write('No materials found. Run seed_materials first.')
            return

        today = timezone.now().date()

        receipts_data = [
            {
                'code': 'PNK001',
                'supplier': suppliers[0] if len(suppliers) > 0 else None,
                'responsible_name': 'Nguyen Van A',
                'receipt_date': today - timedelta(days=30),
                'discount_type': 'percent',
                'discount_value': 0,
                'shipping_fee': 50000,
                'vat_percent': 0,
                'other_fee': 0,
                'status': 'draft',
                'notes': '',
                'items': [
                    {'material': materials[0], 'qty_ordered': 10, 'qty_received': 10, 'unit_price': 50000},
                ] if materials else [],
            },
            {
                'code': 'PNK002',
                'supplier': suppliers[1] if len(suppliers) > 1 else suppliers[0],
                'responsible_name': 'Tran Thi B',
                'receipt_date': today - timedelta(days=20),
                'discount_type': 'percent',
                'discount_value': 5,
                'shipping_fee': 80000,
                'vat_percent': 10,
                'other_fee': 0,
                'status': 'draft',
                'notes': '',
                'items': [
                    {'material': materials[1] if len(materials) > 1 else materials[0], 'qty_ordered': 20, 'qty_received': 18, 'unit_price': 120000},
                    {'material': materials[2] if len(materials) > 2 else materials[0], 'qty_ordered': 15, 'qty_received': 15, 'unit_price': 80000},
                ] if materials else [],
            },
            {
                'code': 'PNK003',
                'supplier': suppliers[2] if len(suppliers) > 2 else suppliers[0],
                'responsible_name': 'Le Van C',
                'receipt_date': today - timedelta(days=15),
                'discount_type': 'fixed',
                'discount_value': 100000,
                'shipping_fee': 0,
                'vat_percent': 0,
                'other_fee': 0,
                'status': 'received',
                'notes': 'Giao hang dung han',
                'items': [
                    {'material': materials[3] if len(materials) > 3 else materials[0], 'qty_ordered': 30, 'qty_received': 30, 'unit_price': 60000},
                ] if materials else [],
            },
            {
                'code': 'PNK004',
                'supplier': suppliers[0],
                'responsible_name': 'Pham Thi D',
                'receipt_date': today - timedelta(days=7),
                'discount_type': 'percent',
                'discount_value': 0,
                'shipping_fee': 120000,
                'vat_percent': 10,
                'other_fee': 50000,
                'status': 'cancelled',
                'notes': 'Huy do nha cung cap khong giao dung so luong',
                'items': [] ,
            },
        ]

        created = 0
        for data in receipts_data:
            from decimal import Decimal, ROUND_HALF_UP

            def _round(v):
                return Decimal(str(v)).quantize(Decimal('1'), rounding=ROUND_HALF_UP)

            items_raw = data.pop('items', [])
            total_goods = Decimal('0')
            prepared = []
            for item_data in items_raw:
                qty = Decimal(str(item_data['qty_received']))
                price = Decimal(str(item_data['unit_price']))
                line_total = _round(qty * price)
                total_goods += line_total
                prepared.append({
                    'material': item_data['material'],
                    'qty_ordered': Decimal(str(item_data.get('qty_ordered', 0))),
                    'qty_received': qty,
                    'unit': item_data['material'].unit or '',
                    'unit_price': price,
                    'line_total': line_total,
                })

            dv = Decimal(str(data['discount_value']))
            sf = _round(data['shipping_fee'])
            vp = Decimal(str(data['vat_percent']))

            if data['discount_type'] == 'percent':
                discount_amount = _round(total_goods * dv / Decimal('100'))
            else:
                discount_amount = _round(dv)
            if discount_amount > total_goods:
                discount_amount = total_goods

            vat_amount = _round((total_goods - discount_amount) * vp / Decimal('100'))
            other_fee  = _round(data.get('other_fee', 0))
            total_value = _round(total_goods - discount_amount + sf + vat_amount + other_fee)

            receipt = WarehouseReceipt.objects.create(
                code=data['code'],
                supplier=data['supplier'],
                responsible_name=data['responsible_name'],
                receipt_date=data['receipt_date'],
                total_goods_value=total_goods,
                discount_type=data['discount_type'],
                discount_value=dv,
                discount_amount=discount_amount,
                shipping_fee=sf,
                vat_percent=vp,
                vat_amount=vat_amount,
                other_fee_label='',
                other_fee=other_fee,
                total_value=total_value,
                status=data['status'],
                notes=data['notes'],
            )

            for item in prepared:
                WarehouseReceiptItem.objects.create(
                    warehouse_receipt=receipt,
                    material=item['material'],
                    quantity_ordered=item['qty_ordered'],
                    quantity_received=item['qty_received'],
                    unit=item['unit'],
                    unit_price=item['unit_price'],
                    line_total=item['line_total'],
                )

            WarehouseReceiptHistory.objects.create(
                warehouse_receipt=receipt,
                actor_name='System',
                action=f'Them moi phieu nhap kho {receipt.code}',
            )
            created += 1

        self.stdout.write(f'Seeded {created} warehouse receipts successfully.')
