from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_add_production_plan_and_request'),
    ]

    operations = [
        migrations.AddField(
            model_name='supplier',
            name='attachment',
            field=models.FileField(blank=True, null=True, upload_to='suppliers/', verbose_name='Tai lieu dinh kem'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='bank_account',
            field=models.CharField(blank=True, default='', max_length=100, verbose_name='So tai khoan'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='bank_name',
            field=models.CharField(blank=True, default='', max_length=150, verbose_name='Ten ngan hang'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='contact_name',
            field=models.CharField(blank=True, default='', max_length=120, verbose_name='Nguoi lien he'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='debt_limit',
            field=models.DecimalField(decimal_places=0, default=0, max_digits=14, verbose_name='Han muc cong no'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='district_code',
            field=models.CharField(blank=True, default='', max_length=20, verbose_name='Ma quan huyen'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='district_name',
            field=models.CharField(blank=True, default='', max_length=120, verbose_name='Quan huyen'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='email',
            field=models.EmailField(blank=True, default='', max_length=254, verbose_name='Email'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='notes',
            field=models.TextField(blank=True, default='', verbose_name='Ghi chu'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='position',
            field=models.CharField(blank=True, default='', max_length=120, verbose_name='Chuc vu'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='province_code',
            field=models.CharField(blank=True, default='', max_length=20, verbose_name='Ma tinh'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='province_name',
            field=models.CharField(blank=True, default='', max_length=120, verbose_name='Tinh thanh pho'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='social_link',
            field=models.CharField(blank=True, default='', max_length=255, verbose_name='Lien ket'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='tax_code',
            field=models.CharField(blank=True, default='', max_length=50, verbose_name='Ma so thue'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='supplier',
            name='ward_code',
            field=models.CharField(blank=True, default='', max_length=20, verbose_name='Ma phuong xa'),
        ),
        migrations.AddField(
            model_name='supplier',
            name='ward_name',
            field=models.CharField(blank=True, default='', max_length=120, verbose_name='Phuong xa'),
        ),
        migrations.AlterField(
            model_name='supplier',
            name='address',
            field=models.TextField(blank=True, default='', verbose_name='Dia chi'),
        ),
        migrations.AlterField(
            model_name='supplier',
            name='phone',
            field=models.CharField(blank=True, default='', max_length=20, verbose_name='So dien thoai'),
        ),
    ]
