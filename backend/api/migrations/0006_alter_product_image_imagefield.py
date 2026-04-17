from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_add_product_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='image',
            field=models.ImageField(blank=True, upload_to='products/', verbose_name='Ảnh sản phẩm'),
        ),
    ]
