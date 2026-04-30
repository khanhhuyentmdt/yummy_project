from django.db import models


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
        'Customer',
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
