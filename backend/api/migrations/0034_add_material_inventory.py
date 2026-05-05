from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_add_warehouse_receipt'),
    ]

    operations = [
        migrations.CreateModel(
            name='MaterialInventory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=3, default=0, max_digits=14, verbose_name='So luong ton hien tai')),
                ('min_quantity', models.DecimalField(decimal_places=3, default=5, max_digits=14, verbose_name='Dinh muc ton kho toi thieu')),
                ('near_expiry_days', models.PositiveIntegerField(default=14, verbose_name='Nguong canh bao can date (ngay)')),
                ('expiry_date', models.DateField(blank=True, null=True, verbose_name='Han su dung')),
                ('unit_cost', models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Don gia nhap')),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('material', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='inventory',
                    to='api.material',
                    verbose_name='Nguyen vat lieu',
                )),
            ],
            options={
                'verbose_name': 'MaterialInventory',
                'ordering': ['-material__id'],
            },
        ),
    ]
