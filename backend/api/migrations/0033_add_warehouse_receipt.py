from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_orderrequest_productionacceptance_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='WarehouseReceipt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=20, unique=True, verbose_name='Ma phieu')),
                ('responsible_name', models.CharField(blank=True, default='', max_length=120, verbose_name='Nguoi phu trach')),
                ('receipt_date', models.DateField(blank=True, null=True, verbose_name='Ngay nhap hang')),
                ('total_goods_value', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Tong tien hang')),
                ('discount_type', models.CharField(choices=[('percent', 'Giam theo phan tram'), ('fixed', 'Giam theo so tien')], default='percent', max_length=20, verbose_name='Loai chiet khau')),
                ('discount_value', models.DecimalField(decimal_places=2, default=0, max_digits=14, verbose_name='Gia tri chiet khau')),
                ('discount_amount', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Tien chiet khau')),
                ('shipping_fee', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Phi van chuyen')),
                ('vat_percent', models.DecimalField(decimal_places=2, default=0, max_digits=5, verbose_name='Ty le VAT')),
                ('vat_amount', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='VAT')),
                ('other_fee_label', models.CharField(blank=True, default='', max_length=255, verbose_name='Noi dung chi phi khac')),
                ('other_fee', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Chi phi khac')),
                ('total_value', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Tien can tra NCC')),
                ('status', models.CharField(choices=[('draft', 'Luu nhap'), ('received', 'Da nhan'), ('cancelled', 'Da huy')], default='draft', max_length=20, verbose_name='Trang thai')),
                ('notes', models.TextField(blank=True, verbose_name='Ghi chu')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('purchase_order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='warehouse_receipts', to='api.purchaseorder', verbose_name='Phieu dat hang lien ket')),
                ('supplier', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='warehouse_receipts', to='api.supplier', verbose_name='Nha cung cap')),
            ],
            options={
                'verbose_name': 'WarehouseReceipt',
                'ordering': ['-id'],
            },
        ),
        migrations.CreateModel(
            name='WarehouseReceiptItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity_ordered', models.DecimalField(decimal_places=3, default=0, max_digits=12, verbose_name='So luong dat')),
                ('quantity_received', models.DecimalField(decimal_places=3, default=0, max_digits=12, verbose_name='So luong nhan')),
                ('unit', models.CharField(blank=True, default='', max_length=50, verbose_name='Don vi tinh')),
                ('unit_price', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Don gia')),
                ('line_total', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Thanh tien')),
                ('notes', models.CharField(blank=True, default='', max_length=255, verbose_name='Ghi chu dong')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('material', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='warehouse_receipt_items', to='api.material', verbose_name='Nguyen vat lieu')),
                ('warehouse_receipt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='api.warehousereceipt', verbose_name='Phieu nhap kho')),
            ],
            options={
                'verbose_name': 'WarehouseReceiptItem',
                'ordering': ['id'],
            },
        ),
        migrations.CreateModel(
            name='WarehouseReceiptHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('actor_name', models.CharField(blank=True, default='', max_length=120)),
                ('action', models.CharField(max_length=255)),
                ('warehouse_receipt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='api.warehousereceipt', verbose_name='Phieu nhap kho')),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
    ]
