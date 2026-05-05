from django.db import migrations, models
import django.db.models.deletion


def forwards(apps, schema_editor):
    PurchaseOrder = apps.get_model('api', 'PurchaseOrder')
    for order in PurchaseOrder.objects.all():
        order.total_goods_value = order.total_value or 0
        order.save(update_fields=['total_goods_value'])


def backwards(apps, schema_editor):
    PurchaseOrder = apps.get_model('api', 'PurchaseOrder')
    for order in PurchaseOrder.objects.all():
        order.total_value = order.total_goods_value or order.total_value or 0
        order.save(update_fields=['total_value'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_bootstrap_state_and_production_defaults'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchaseorder',
            name='supplier',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='purchase_orders', to='api.supplier', verbose_name='Nha cung cap'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='responsible_name',
            field=models.CharField(blank=True, default='', max_length=120, verbose_name='Nguoi phu trach'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='order_date',
            field=models.DateField(blank=True, null=True, verbose_name='Ngay dat hang'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='expected_delivery_date',
            field=models.DateField(blank=True, null=True, verbose_name='Ngay ve kho du kien'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='total_goods_value',
            field=models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Tong tien hang'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='discount_type',
            field=models.CharField(choices=[('percent', 'Giam theo phan tram'), ('fixed', 'Giam theo so tien')], default='percent', max_length=20, verbose_name='Loai chiet khau'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='discount_value',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=14, verbose_name='Gia tri chiet khau'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='discount_amount',
            field=models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Tien chiet khau'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='shipping_fee',
            field=models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Phi van chuyen'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='vat_amount',
            field=models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='VAT'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='other_fee',
            field=models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Chi phi khac'),
        ),
        migrations.CreateModel(
            name='PurchaseOrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=3, default=0, max_digits=12, verbose_name='So luong')),
                ('unit', models.CharField(blank=True, default='', max_length=50, verbose_name='Don vi tinh')),
                ('unit_price', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Don gia')),
                ('line_total', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Thanh tien')),
                ('notes', models.CharField(blank=True, default='', max_length=255, verbose_name='Ghi chu dong')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('material', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='purchase_order_items', to='api.material', verbose_name='Nguyen vat lieu')),
                ('purchase_order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='api.purchaseorder', verbose_name='Phieu dat hang')),
            ],
            options={
                'ordering': ['id'],
                'verbose_name': 'PurchaseOrderItem',
            },
        ),
        migrations.RunPython(forwards, backwards),
    ]
