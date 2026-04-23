from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_product_image_imagefield'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='role',
            field=models.CharField(blank=True, max_length=100, verbose_name='Vai tro'),
        ),
        migrations.CreateModel(
            name='Material',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code',  models.CharField(max_length=20, unique=True, verbose_name='Mã NVL')),
                ('name',  models.CharField(max_length=200, verbose_name='Tên NVL')),
                ('group', models.CharField(max_length=100, verbose_name='Nhóm NVL')),
                ('unit',  models.CharField(max_length=50, verbose_name='Đơn vị tính')),
                ('image', models.ImageField(blank=True, upload_to='materials/', verbose_name='Hình ảnh')),
                ('status', models.CharField(
                    choices=[('active', 'Đang hoạt động'), ('inactive', 'Tạm ngưng')],
                    default='active',
                    max_length=20,
                    verbose_name='Trạng thái',
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Material',
                'ordering': ['-id'],
            },
        ),
    ]
