"""
python manage.py export_products
Xuat toan bo du lieu Product ra <project_root>/data_sync/products.json
"""
import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import Product

# data_sync/ nam o thu muc goc cua project (ngang hang voi backend/)
DATA_SYNC_DIR = Path(settings.BASE_DIR).parent / 'data_sync'
OUTPUT_FILE   = DATA_SYNC_DIR / 'products.json'


class Command(BaseCommand):
    help = 'Xuat Product ra data_sync/products.json'

    def handle(self, *args, **options):
        DATA_SYNC_DIR.mkdir(parents=True, exist_ok=True)

        products = list(
            Product.objects.values(
                'id', 'code', 'name', 'group', 'unit',
                'quantity', 'price', 'status',
                'created_at', 'updated_at',
            )
        )

        # Convert Decimal va datetime thanh kieu JSON-serializable
        for p in products:
            p['price']      = int(p['price'])
            p['created_at'] = p['created_at'].isoformat() if p['created_at'] else None
            p['updated_at'] = p['updated_at'].isoformat() if p['updated_at'] else None

        payload = {
            'exported_at': timezone.now().isoformat(),
            'total':       len(products),
            'products':    products,
        }

        OUTPUT_FILE.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding='utf-8',
        )

        self.stdout.write(
            f'Exported {len(products)} products -> {OUTPUT_FILE}'
        )
