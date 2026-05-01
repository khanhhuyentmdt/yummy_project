from django.core.management.base import BaseCommand
from api.models import Benefit
from datetime import date


SAMPLE_BENEFITS = [
    {
        'code': 'MPL001',
        'name': 'Qua sinh nhat',
        'benefit_type': 'van_hoa',
        'scope': 'toan_cong_ty',
        'cycle': 'su_kien',
        'effective_from': date(2024, 1, 1),
        'effective_to': date(2026, 12, 31),
        'value': 300000,
        'value_unit': 'dong',
        'notes': 'Tang qua sinh nhat cho nhan vien vao ngay sinh nhat cua ho',
        'status': 'inactive',
    },
    {
        'code': 'MPL002',
        'name': 'Phu cap an trua',
        'benefit_type': 'phu_cap',
        'scope': 'toan_cong_ty',
        'cycle': 'hang_ngay',
        'effective_from': date(2024, 1, 1),
        'effective_to': date(2026, 12, 31),
        'value': 50000,
        'value_unit': 'dong',
        'notes': 'Ho tro bua an trua cho toan bo nhan vien',
        'status': 'inactive',
    },
    {
        'code': 'MPL003',
        'name': 'Tet Nguyen Dan',
        'benefit_type': 'chinh_sach',
        'scope': 'toan_cong_ty',
        'cycle': 'ngay_le_tet',
        'effective_from': date(2024, 1, 1),
        'effective_to': date(2026, 12, 31),
        'value': 2000000,
        'value_unit': 'dong',
        'notes': 'Thuong Tet Nguyen Dan cho toan bo nhan vien',
        'status': 'active',
    },
    {
        'code': 'MPL004',
        'name': 'Phu cap nang luc quan ly',
        'benefit_type': 'phu_cap',
        'scope': 'theo_vai_tro',
        'cycle': 'hang_thang',
        'effective_from': date(2024, 1, 1),
        'effective_to': date(2026, 12, 31),
        'value': 1500000,
        'value_unit': 'dong',
        'notes': 'Phu cap cho cac vi tri quan ly',
        'status': 'active',
    },
]


class Command(BaseCommand):
    help = 'Seed sample benefit data'

    def handle(self, *args, **kwargs):
        created = 0
        skipped = 0
        for data in SAMPLE_BENEFITS:
            obj, is_new = Benefit.objects.get_or_create(
                code=data['code'],
                defaults=data,
            )
            if is_new:
                created += 1
            else:
                skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Done: {created} created, {skipped} skipped'
            )
        )
