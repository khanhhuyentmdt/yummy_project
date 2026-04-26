from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom manager — dùng phone_number thay cho username."""

    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('Phone number is required.')
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractUser):
    """Custom User — phone_number là định danh chính, không có username."""

    username   = None  # Xóa trường username của AbstractUser
    phone_number = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Phone number',
    )
    full_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Full name',
    )
    role = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Vai tro',
    )

    objects = UserManager()

    USERNAME_FIELD  = 'phone_number'
    REQUIRED_FIELDS = []          # Không yêu cầu thêm field nào khi create_superuser

    class Meta:
        verbose_name        = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.full_name or self.phone_number

    def get_full_name(self):
        return self.full_name or self.phone_number


# ─── Product ──────────────────────────────────────────────────────────────────

class Product(models.Model):
    STATUS_ACTIVE   = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES  = [
        (STATUS_ACTIVE,   'Đang hoạt động'),
        (STATUS_INACTIVE, 'Tạm ngưng'),
    ]

    code             = models.CharField(max_length=20, unique=True, verbose_name='Mã SP')
    name             = models.CharField(max_length=200, verbose_name='Tên sản phẩm')
    group            = models.CharField(max_length=100, verbose_name='Nhóm SP')
    unit             = models.CharField(max_length=50,  verbose_name='ĐVT')
    quantity         = models.IntegerField(default=0, verbose_name='Số lượng tồn kho')
    price            = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='Giá bán')
    cost_price       = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name='Giá vốn')
    compare_price    = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name='Giá so sánh')
    description      = models.TextField(blank=True, verbose_name='Mô tả sản phẩm')
    production_notes = models.TextField(blank=True, verbose_name='Ghi chú sản xuất')
    notes            = models.TextField(blank=True, verbose_name='Ghi chú')
    image            = models.ImageField(upload_to='products/', blank=True, verbose_name='Ảnh sản phẩm')
    status           = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name='Trạng thái',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-id']
        verbose_name = 'Product'

    def __str__(self):
        return f'{self.code} — {self.name}'


# ─── RawMaterial ─────────────────────────────────────────────────────────────

class RawMaterial(models.Model):
    code       = models.CharField(max_length=20, unique=True, verbose_name='Mã NL')
    name       = models.CharField(max_length=200, verbose_name='Tên nguyên liệu')
    unit       = models.CharField(max_length=50,  verbose_name='ĐVT')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering     = ['name']
        verbose_name = 'RawMaterial'

    def __str__(self):
        return f'{self.code} - {self.name}'


# ─── ProductBOM ───────────────────────────────────────────────────────────────

class ProductBOM(models.Model):
    product      = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='bom_items',
        verbose_name='Sản phẩm',
    )
    raw_material = models.ForeignKey(
        RawMaterial, on_delete=models.PROTECT, related_name='bom_items',
        verbose_name='Nguyên liệu',
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3, verbose_name='Định lượng')
    unit     = models.CharField(max_length=50, blank=True, verbose_name='ĐVT')

    class Meta:
        unique_together = [['product', 'raw_material']]
        verbose_name    = 'ProductBOM'

    def __str__(self):
        return f'{self.product.code} - {self.raw_material.name} x{self.quantity}'


# ─── Customer ─────────────────────────────────────────────────────────────────

class Customer(models.Model):
    name       = models.CharField(max_length=200, verbose_name='Tên khách hàng')
    phone      = models.CharField(max_length=20,  verbose_name='Số điện thoại')
    email      = models.EmailField(blank=True,     verbose_name='Email')
    address    = models.TextField(blank=True,      verbose_name='Địa chỉ')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering     = ['name']
        verbose_name = 'Customer'

    def __str__(self):
        return self.name


# ─── Order ────────────────────────────────────────────────────────────────────

class Order(models.Model):
    STATUS_PENDING   = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES   = [
        (STATUS_PENDING,   'Chờ xác nhận'),
        (STATUS_CONFIRMED, 'Đã xác nhận'),
        (STATUS_DELIVERED, 'Đã giao'),
        (STATUS_CANCELLED, 'Đã huỷ'),
    ]

    code       = models.CharField(max_length=20, unique=True, verbose_name='Mã đơn')
    customer   = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name='Khách hàng',
    )
    total      = models.DecimalField(max_digits=14, decimal_places=0, verbose_name='Tổng tiền')
    status     = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        verbose_name='Trạng thái',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering     = ['-created_at']
        verbose_name = 'Order'

    def __str__(self):
        return self.code


# ─── Material ─────────────────────────────────────────────────────────────────

class Material(models.Model):
    STATUS_ACTIVE   = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES  = [
        (STATUS_ACTIVE,   'Đang hoạt động'),
        (STATUS_INACTIVE, 'Tạm ngưng'),
    ]

    code   = models.CharField(max_length=20, unique=True, verbose_name='Mã NVL')
    name   = models.CharField(max_length=200, verbose_name='Tên NVL')
    group  = models.CharField(max_length=100, verbose_name='Nhóm NVL')
    unit   = models.CharField(max_length=50,  verbose_name='Đơn vị tính')
    image            = models.ImageField(upload_to='materials/', blank=True, verbose_name='Hình ảnh')
    notes            = models.TextField(blank=True, verbose_name='Ghi chu')
    batch_management = models.BooleanField(default=False, verbose_name='Quan ly theo lo HSD')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name='Trạng thái',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-id']
        verbose_name = 'Material'

    def __str__(self):
        return f'{self.code} — {self.name}'


# ─── Supplier ─────────────────────────────────────────────────────────────────

class Supplier(models.Model):
    name    = models.CharField(max_length=200, verbose_name='Ten nha cung cap')
    phone   = models.CharField(max_length=20,  blank=True, verbose_name='So dien thoai')
    address = models.TextField(blank=True, verbose_name='Dia chi')
    status  = models.CharField(
        max_length=20,
        choices=[('active', 'Dang hoat dong'), ('inactive', 'Tam ngung')],
        default='active',
        verbose_name='Trang thai',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering     = ['name']
        verbose_name = 'Supplier'

    def __str__(self):
        return self.name


# ─── PurchaseOrder ────────────────────────────────────────────────────────────

class PurchaseOrder(models.Model):
    STATUS_DRAFT     = 'draft'
    STATUS_WAITING   = 'waiting'
    STATUS_RECEIVED  = 'received'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES   = [
        (STATUS_DRAFT,     'Luu nhap'),
        (STATUS_WAITING,   'Cho nhan'),
        (STATUS_RECEIVED,  'Da nhan'),
        (STATUS_CANCELLED, 'Da huy'),
    ]

    code        = models.CharField(max_length=20, unique=True, verbose_name='Ma phieu')
    supplier    = models.ForeignKey(
        Supplier, on_delete=models.PROTECT,
        related_name='purchase_orders', verbose_name='Nha cung cap',
    )
    total_value = models.DecimalField(
        max_digits=14, decimal_places=0, default=0, verbose_name='Tong gia tri',
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES,
        default=STATUS_DRAFT, verbose_name='Trang thai',
    )
    notes      = models.TextField(blank=True, verbose_name='Ghi chu')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-id']
        verbose_name = 'PurchaseOrder'

    def __str__(self):
        return self.code
