from django.db import models


class Location(models.Model):
    STATUS_ACTIVE   = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES  = [
        (STATUS_ACTIVE,   'Dang hoat dong'),
        (STATUS_INACTIVE, 'Tam ngung'),
    ]

    code     = models.CharField(max_length=20, unique=True, verbose_name='Ma dia diem')
    name     = models.CharField(max_length=200, unique=True, verbose_name='Ten dia diem')
    manager  = models.ForeignKey(
        'User',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='managed_locations',
        verbose_name='Nhan vien quan ly',
    )
    phone    = models.CharField(max_length=20, blank=True, verbose_name='So dien thoai')
    email    = models.CharField(max_length=200, blank=True, verbose_name='Email')
    address  = models.TextField(blank=True, verbose_name='Dia chi')
    province = models.CharField(max_length=100, blank=True, verbose_name='Tinh thanh pho')
    district = models.CharField(max_length=100, blank=True, verbose_name='Quan huyen')
    ward     = models.CharField(max_length=100, blank=True, verbose_name='Phuong xa')
    # Loai dia diem: comma-separated 'san_xuat', 'kho_hang', 'cua_hang'
    location_types   = models.CharField(max_length=100, blank=True, verbose_name='Loai dia diem')
    # Thiet lap dia diem
    manage_nvl        = models.BooleanField(default=False, verbose_name='Quan ly NVL')
    manage_btp        = models.BooleanField(default=False, verbose_name='Quan ly BTP')
    manage_thanh_pham = models.BooleanField(default=False, verbose_name='Quan ly thanh pham')
    allow_delivery    = models.BooleanField(default=False, verbose_name='Cho phep giao hang')
    status  = models.CharField(
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
        verbose_name = 'Location'

    def __str__(self):
        return f'{self.code} — {self.name}'


class LocationHistory(models.Model):
    location   = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name='history',
        verbose_name='Dia diem',
    )
    timestamp  = models.DateTimeField(auto_now_add=True)
    actor_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi thuc hien')
    action     = models.CharField(max_length=300, verbose_name='Hanh dong')

    class Meta:
        ordering     = ['-timestamp']
        verbose_name = 'LocationHistory'

    def __str__(self):
        return f'{self.location.code} — {self.action}'
