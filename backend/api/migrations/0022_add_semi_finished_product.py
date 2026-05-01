from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_rename_material_group_codes'),
    ]

    operations = [
        migrations.CreateModel(
            name='SemiFinishedProduct',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=20, unique=True, verbose_name='Mã BTP')),
                ('name', models.CharField(max_length=200, verbose_name='Tên bán thành phẩm')),
                ('group', models.CharField(blank=True, default='', max_length=100, verbose_name='Nhóm BTP')),
                ('unit', models.CharField(max_length=50, verbose_name='ĐVT')),
                ('quantity', models.IntegerField(default=0, verbose_name='Số lượng tồn kho')),
                ('price', models.DecimalField(decimal_places=0, max_digits=12, verbose_name='Giá điều chuyển')),
                ('cost_price', models.DecimalField(decimal_places=0, default=0, max_digits=12, verbose_name='Giá vốn')),
                ('compare_price', models.DecimalField(decimal_places=0, default=0, max_digits=12, verbose_name='Giá so sánh')),
                ('description', models.TextField(blank=True, verbose_name='Mô tả bán thành phẩm')),
                ('production_notes', models.TextField(blank=True, verbose_name='Ghi chú sản xuất')),
                ('notes', models.TextField(blank=True, verbose_name='Ghi chú')),
                ('image', models.ImageField(blank=True, upload_to='semi_finished_products/', verbose_name='Ảnh bán thành phẩm')),
                ('status', models.CharField(choices=[('active', 'Đang hoạt động'), ('inactive', 'Tạm ngưng')], default='active', max_length=20, verbose_name='Trạng thái')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Semi Finished Product',
                'verbose_name_plural': 'Semi Finished Products',
                'ordering': ['-id'],
            },
        ),
        migrations.CreateModel(
            name='SemiFinishedProductBOM',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=3, max_digits=10, verbose_name='Định lượng')),
                ('unit', models.CharField(blank=True, max_length=50, verbose_name='ĐVT')),
                ('raw_material', models.ForeignKey(on_delete=models.deletion.PROTECT, related_name='semi_finished_bom_items', to='api.rawmaterial', verbose_name='Nguyên liệu')),
                ('semi_finished_product', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='bom_items', to='api.semifinishedproduct', verbose_name='Bán thành phẩm')),
            ],
            options={
                'verbose_name': 'Semi Finished Product BOM',
                'verbose_name_plural': 'Semi Finished Product BOMs',
                'unique_together': {('semi_finished_product', 'raw_material')},
            },
        ),
    ]
