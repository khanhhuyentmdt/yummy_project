from django.db import models


class ShippingUnit(models.Model):
    STATUS_ACTIVE   = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES  = [
        (STATUS_ACTIVE,   'Dang hoat dong'),
        (STATUS_INACTIVE, 'Ngung hoat dong'),
    ]

    code     = models.CharField(max_length=20, unique=True, verbose_name='Ma doi tac')
    name     = models.CharField(max_length=200, unique=True, verbose_name='Ten doi tac')
    phone    = models.CharField(max_length=20, blank=True, verbose_name='So dien thoai')
    email    = models.EmailField(max_length=200, blank=True, verbose_name='Email')
    address  = models.CharField(max_length=500, blank=True, verbose_name='Dia chi')
    city     = models.CharField(max_length=100, blank=True, verbose_name='Tinh/Thanh pho')
    district = models.CharField(max_length=100, blank=True, verbose_name='Quan/Huyen')
    ward     = models.CharField(max_length=100, blank=True, verbose_name='Phuong/Xa')
    notes    = models.TextField(blank=True, verbose_name='Ghi chu')
    status   = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name='Trang thai',
    )
    created_by_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi tao')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-id']
        verbose_name = 'ShippingUnit'

    def __str__(self):
        return f'{self.code} — {self.name}'


class ShippingUnitHistory(models.Model):
    shipping_unit = models.ForeignKey(
        ShippingUnit, on_delete=models.CASCADE, related_name='history',
        verbose_name='Don vi van chuyen',
    )
    timestamp  = models.DateTimeField(auto_now_add=True)
    actor_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi thuc hien')
    action     = models.CharField(max_length=300, verbose_name='Hanh dong')

    class Meta:
        ordering     = ['-timestamp']
        verbose_name = 'ShippingUnitHistory'

    def __str__(self):
        return f'{self.shipping_unit.code} — {self.action}'
