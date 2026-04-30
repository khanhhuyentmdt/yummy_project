from django.db import models


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
        'Supplier', on_delete=models.PROTECT,
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
