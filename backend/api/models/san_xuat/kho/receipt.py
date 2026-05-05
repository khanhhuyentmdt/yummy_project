from django.db import models


class WarehouseReceipt(models.Model):
    STATUS_DRAFT     = 'draft'
    STATUS_RECEIVED  = 'received'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES   = [
        (STATUS_DRAFT,     'Luu nhap'),
        (STATUS_RECEIVED,  'Da nhan'),
        (STATUS_CANCELLED, 'Da huy'),
    ]
    DISCOUNT_PERCENT = 'percent'
    DISCOUNT_FIXED   = 'fixed'
    DISCOUNT_TYPE_CHOICES = [
        (DISCOUNT_PERCENT, 'Giam theo phan tram'),
        (DISCOUNT_FIXED,   'Giam theo so tien'),
    ]

    code             = models.CharField(max_length=20, unique=True, verbose_name='Ma phieu')
    purchase_order   = models.ForeignKey(
        'PurchaseOrder', on_delete=models.SET_NULL,
        related_name='warehouse_receipts', verbose_name='Phieu dat hang lien ket',
        null=True, blank=True,
    )
    supplier         = models.ForeignKey(
        'Supplier', on_delete=models.PROTECT,
        related_name='warehouse_receipts', verbose_name='Nha cung cap',
        null=True, blank=True,
    )
    responsible_name = models.CharField(max_length=120, blank=True, default='', verbose_name='Nguoi phu trach')
    receipt_date     = models.DateField(null=True, blank=True, verbose_name='Ngay nhap hang')
    total_goods_value = models.DecimalField(
        max_digits=14, decimal_places=0, default=0, verbose_name='Tong tien hang',
    )
    discount_type    = models.CharField(
        max_length=20, choices=DISCOUNT_TYPE_CHOICES,
        default=DISCOUNT_PERCENT, verbose_name='Loai chiet khau',
    )
    discount_value   = models.DecimalField(
        max_digits=14, decimal_places=2, default=0, verbose_name='Gia tri chiet khau',
    )
    discount_amount  = models.DecimalField(
        max_digits=14, decimal_places=0, default=0, verbose_name='Tien chiet khau',
    )
    shipping_fee     = models.DecimalField(
        max_digits=14, decimal_places=0, default=0, verbose_name='Phi van chuyen',
    )
    vat_percent      = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name='Ty le VAT',
    )
    vat_amount       = models.DecimalField(
        max_digits=14, decimal_places=0, default=0, verbose_name='VAT',
    )
    other_fee_label  = models.CharField(
        max_length=255, blank=True, default='', verbose_name='Noi dung chi phi khac',
    )
    other_fee        = models.DecimalField(
        max_digits=14, decimal_places=0, default=0, verbose_name='Chi phi khac',
    )
    total_value      = models.DecimalField(
        max_digits=14, decimal_places=0, default=0, verbose_name='Tien can tra NCC',
    )
    status           = models.CharField(
        max_length=20, choices=STATUS_CHOICES,
        default=STATUS_DRAFT, verbose_name='Trang thai',
    )
    notes            = models.TextField(blank=True, verbose_name='Ghi chu')
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-id']
        verbose_name = 'WarehouseReceipt'

    def __str__(self):
        return self.code


class WarehouseReceiptItem(models.Model):
    warehouse_receipt = models.ForeignKey(
        'WarehouseReceipt', on_delete=models.CASCADE,
        related_name='items', verbose_name='Phieu nhap kho',
    )
    material          = models.ForeignKey(
        'Material', on_delete=models.PROTECT,
        related_name='warehouse_receipt_items', verbose_name='Nguyen vat lieu',
    )
    quantity_ordered  = models.DecimalField(
        max_digits=12, decimal_places=3, default=0, verbose_name='So luong dat',
    )
    quantity_received = models.DecimalField(
        max_digits=12, decimal_places=3, default=0, verbose_name='So luong nhan',
    )
    unit              = models.CharField(max_length=50, blank=True, default='', verbose_name='Don vi tinh')
    unit_price        = models.DecimalField(
        max_digits=14, decimal_places=0, default=0, verbose_name='Don gia',
    )
    line_total        = models.DecimalField(
        max_digits=14, decimal_places=0, default=0, verbose_name='Thanh tien',
    )
    notes             = models.CharField(max_length=255, blank=True, default='', verbose_name='Ghi chu dong')
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['id']
        verbose_name = 'WarehouseReceiptItem'

    def __str__(self):
        return f'{self.warehouse_receipt.code} - {self.material.name}'


class WarehouseReceiptHistory(models.Model):
    warehouse_receipt = models.ForeignKey(
        'WarehouseReceipt', on_delete=models.CASCADE,
        related_name='history', verbose_name='Phieu nhap kho',
    )
    timestamp    = models.DateTimeField(auto_now_add=True)
    actor_name   = models.CharField(max_length=120, blank=True, default='')
    action       = models.CharField(max_length=255)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.warehouse_receipt.code}: {self.action}'
