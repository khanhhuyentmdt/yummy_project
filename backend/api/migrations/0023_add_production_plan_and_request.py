from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_add_semi_finished_product'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductionPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=20, unique=True, verbose_name='Mã kế hoạch')),
                ('name', models.CharField(max_length=200, verbose_name='Tên kế hoạch')),
                ('start_date', models.DateField(blank=True, null=True, verbose_name='Ngày bắt đầu')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='Ngày kết thúc')),
                ('notes', models.TextField(blank=True, verbose_name='Ghi chú')),
                ('status', models.CharField(choices=[('draft', 'Lưu nháp'), ('pending', 'Chờ gửi'), ('sent', 'Đã gửi hàng'), ('cancelled', 'Đã hủy')], default='draft', max_length=20, verbose_name='Trạng thái')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Production Plan',
                'verbose_name_plural': 'Production Plans',
                'ordering': ['-id'],
            },
        ),
        migrations.CreateModel(
            name='ProductionRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=20, unique=True, verbose_name='Mã yêu cầu')),
                ('name', models.CharField(max_length=200, verbose_name='Tên yêu cầu')),
                ('request_date', models.DateField(blank=True, null=True, verbose_name='Ngày yêu cầu')),
                ('expected_date', models.DateField(blank=True, null=True, verbose_name='Ngày mong muốn')),
                ('notes', models.TextField(blank=True, verbose_name='Ghi chú')),
                ('status', models.CharField(choices=[('draft', 'Lưu nháp'), ('pending', 'Chờ xử lý'), ('approved', 'Đã duyệt'), ('cancelled', 'Đã hủy')], default='draft', max_length=20, verbose_name='Trạng thái')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Production Request',
                'verbose_name_plural': 'Production Requests',
                'ordering': ['-id'],
            },
        ),
        migrations.CreateModel(
            name='ProductionRequestItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=3, default=0, max_digits=12, verbose_name='Số lượng')),
                ('notes', models.CharField(blank=True, default='', max_length=255, verbose_name='Ghi chú dòng')),
                ('production_request', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='api.productionrequest', verbose_name='Yêu cầu sản xuất')),
                ('semi_finished_product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='production_request_items', to='api.semifinishedproduct', verbose_name='Bán thành phẩm')),
            ],
            options={
                'verbose_name': 'Production Request Item',
                'verbose_name_plural': 'Production Request Items',
                'ordering': ['id'],
            },
        ),
        migrations.CreateModel(
            name='ProductionPlanItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=3, default=0, max_digits=12, verbose_name='Số lượng')),
                ('duration_minutes', models.IntegerField(default=0, verbose_name='Thời lượng (phút)')),
                ('production_plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='api.productionplan', verbose_name='Kế hoạch sản xuất')),
                ('semi_finished_product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='production_plan_items', to='api.semifinishedproduct', verbose_name='Bán thành phẩm')),
            ],
            options={
                'verbose_name': 'Production Plan Item',
                'verbose_name_plural': 'Production Plan Items',
                'ordering': ['id'],
            },
        ),
    ]
