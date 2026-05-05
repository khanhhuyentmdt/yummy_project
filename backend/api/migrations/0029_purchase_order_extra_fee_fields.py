from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_extend_purchase_orders'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='vat_percent',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5, verbose_name='Ty le VAT'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='other_fee_label',
            field=models.CharField(blank=True, default='', max_length=255, verbose_name='Noi dung chi phi khac'),
        ),
    ]
