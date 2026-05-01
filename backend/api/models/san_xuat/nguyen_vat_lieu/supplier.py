from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=200, verbose_name='Ten nha cung cap')
    tax_code = models.CharField(max_length=50, blank=True, default='', verbose_name='Ma so thue')
    contact_name = models.CharField(max_length=120, blank=True, default='', verbose_name='Nguoi lien he')
    position = models.CharField(max_length=120, blank=True, default='', verbose_name='Chuc vu')
    phone = models.CharField(max_length=20, blank=True, default='', verbose_name='So dien thoai')
    email = models.EmailField(blank=True, default='', verbose_name='Email')
    social_link = models.CharField(max_length=255, blank=True, default='', verbose_name='Lien ket')
    address = models.TextField(blank=True, default='', verbose_name='Dia chi')
    province_code = models.CharField(max_length=20, blank=True, default='', verbose_name='Ma tinh')
    province_name = models.CharField(max_length=120, blank=True, default='', verbose_name='Tinh thanh pho')
    district_code = models.CharField(max_length=20, blank=True, default='', verbose_name='Ma quan huyen')
    district_name = models.CharField(max_length=120, blank=True, default='', verbose_name='Quan huyen')
    ward_code = models.CharField(max_length=20, blank=True, default='', verbose_name='Ma phuong xa')
    ward_name = models.CharField(max_length=120, blank=True, default='', verbose_name='Phuong xa')
    debt_limit = models.DecimalField(max_digits=14, decimal_places=0, default=0, verbose_name='Han muc cong no')
    bank_account = models.CharField(max_length=100, blank=True, default='', verbose_name='So tai khoan')
    bank_name = models.CharField(max_length=150, blank=True, default='', verbose_name='Ten ngan hang')
    notes = models.TextField(blank=True, default='', verbose_name='Ghi chu')
    attachment = models.FileField(upload_to='suppliers/', blank=True, null=True, verbose_name='Tai lieu dinh kem')
    status = models.CharField(
        max_length=20,
        choices=[('active', 'Dang hoat dong'), ('inactive', 'Tam ngung')],
        default='active',
        verbose_name='Trang thai',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['name']
        verbose_name = 'Supplier'

    def __str__(self):
        return self.name
