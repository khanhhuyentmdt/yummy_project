from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0026_product_bom_material_fk'),
    ]

    operations = [
        migrations.CreateModel(
            name='BootstrapState',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=100, unique=True)),
                ('is_completed', models.BooleanField(default=False)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('notes', models.CharField(blank=True, default='', max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Bootstrap State',
                'verbose_name_plural': 'Bootstrap States',
                'ordering': ['key'],
            },
        ),
    ]
