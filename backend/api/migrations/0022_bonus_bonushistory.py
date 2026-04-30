from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_auto_20260430_1511'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bonus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=20, unique=True, verbose_name='Ma thuong')),
                ('reason', models.CharField(max_length=500, verbose_name='Ly do thuong')),
                ('bonus_date', models.DateField(verbose_name='Ngay thuong')),
                ('total_amount', models.DecimalField(decimal_places=0, default=0, max_digits=15, verbose_name='Muc thuong tong')),
                ('recipient_type', models.CharField(
                    choices=[('all', 'Tat ca nhan vien'), ('custom', 'Tuy chon')],
                    default='all', max_length=20, verbose_name='Nhan vien duoc thuong',
                )),
                ('employee_count', models.PositiveIntegerField(default=0, verbose_name='So luong NV duoc thuong')),
                ('bonus_type', models.CharField(
                    choices=[('direct', 'Thuong truc tiep'), ('salary_addition', 'Thuong cong vao luong')],
                    default='direct', max_length=30, verbose_name='Hinh thuc thuong',
                )),
                ('notes', models.TextField(blank=True, verbose_name='Ghi chu')),
                ('status', models.CharField(
                    choices=[('chua_thanh_toan', 'Chua thanh toan'), ('da_thanh_toan', 'Da thanh toan'), ('da_huy', 'Da huy')],
                    default='chua_thanh_toan', max_length=20, verbose_name='Trang thai',
                )),
                ('created_by_name', models.CharField(blank=True, max_length=200, verbose_name='Nguoi tao')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Bonus',
                'ordering': ['-id'],
            },
        ),
        migrations.CreateModel(
            name='BonusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('actor_name', models.CharField(blank=True, max_length=200, verbose_name='Nguoi thuc hien')),
                ('action', models.CharField(max_length=300, verbose_name='Hanh dong')),
                ('field_name', models.CharField(blank=True, max_length=100, verbose_name='Ten truong')),
                ('old_value', models.TextField(blank=True, verbose_name='Gia tri cu')),
                ('new_value', models.TextField(blank=True, verbose_name='Gia tri moi')),
                ('bonus', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='history',
                    to='api.bonus',
                    verbose_name='Thuong',
                )),
            ],
            options={
                'verbose_name': 'BonusHistory',
                'ordering': ['-timestamp'],
            },
        ),
    ]
