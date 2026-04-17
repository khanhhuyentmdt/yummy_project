from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_product_extended_fields_rawmaterial_bom'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='image',
            field=models.CharField(blank=True, default='', max_length=500, verbose_name='Ảnh sản phẩm'),
        ),
    ]
