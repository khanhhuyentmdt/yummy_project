"""
Seed semi-finished products for testing.

Usage:
    python manage.py seed_semi_finished_products
"""
from django.core.management.base import BaseCommand
from api.models import SemiFinishedProduct, ProductGroup


class Command(BaseCommand):
    help = 'Seed semi-finished products for testing'

    def handle(self, *args, **options):
        # Get or create a product group
        group, _ = ProductGroup.objects.get_or_create(
            code='BTP001',
            defaults={'name': 'Bán thành phẩm chung'}
        )

        # Clear existing semi-finished products
        SemiFinishedProduct.objects.all().delete()
        self.stdout.write('Cleared existing semi-finished products.')

        # Create sample semi-finished products
        products_data = [
            {
                'code': 'BTP001',
                'name': 'Bột trà xanh pha sẵn',
                'unit': 'Kg',
                'quantity': 50,
                'price': 150000,
                'notes': 'Bột trà xanh đã pha sẵn để làm đồ uống',
            },
            {
                'code': 'BTP002',
                'name': 'Siro đường nâu',
                'unit': 'Lít',
                'quantity': 30,
                'price': 80000,
                'notes': 'Siro đường nâu tự làm',
            },
            {
                'code': 'BTP003',
                'name': 'Trân châu đen nấu sẵn',
                'unit': 'Kg',
                'quantity': 20,
                'price': 120000,
                'notes': 'Trân châu đen đã nấu chín',
            },
            {
                'code': 'BTP004',
                'name': 'Kem cheese tươi',
                'unit': 'Kg',
                'quantity': 15,
                'price': 200000,
                'notes': 'Kem cheese tự làm',
            },
            {
                'code': 'BTP005',
                'name': 'Thạch dừa cắt nhỏ',
                'unit': 'Kg',
                'quantity': 25,
                'price': 90000,
                'notes': 'Thạch dừa đã cắt nhỏ sẵn',
            },
        ]

        for product_data in products_data:
            product = SemiFinishedProduct.objects.create(
                group=group,
                **product_data
            )
            self.stdout.write(self.style.SUCCESS(f'Created: {product.code} - {product.name}'))

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(products_data)} semi-finished products!'))
