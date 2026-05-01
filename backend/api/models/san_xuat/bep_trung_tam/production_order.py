from django.db import models


class ProductionOrder(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Lưu nháp'),
        (STATUS_IN_PROGRESS, 'Đang sản xuất'),
        (STATUS_COMPLETED, 'Hoàn thành'),
        (STATUS_CANCELLED, 'Đã hủy'),
    ]

    code = models.CharField(max_length=20, unique=True, verbose_name='Mã lệnh sản xuất')
    name = models.CharField(max_length=200, verbose_name='Tên lệnh sản xuất')
    order_request = models.ForeignKey(
        'OrderRequest',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='production_orders',
        verbose_name='Yêu cầu đặt hàng',
    )
    production_plan = models.ForeignKey(
        'ProductionPlan',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='production_orders',
        verbose_name='Kế hoạch sản xuất',
    )
    start_date = models.DateField(null=True, blank=True, verbose_name='Ngày bắt đầu')
    end_date = models.DateField(null=True, blank=True, verbose_name='Ngày kết thúc')
    notes = models.TextField(blank=True, verbose_name='Ghi chú')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
        verbose_name='Trạng thái',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']
        verbose_name = 'Production Order'
        verbose_name_plural = 'Production Orders'

    def __str__(self):
        return f'{self.code} - {self.name}'


class ProductionOrderItem(models.Model):
    production_order = models.ForeignKey(
        'ProductionOrder',
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Lệnh sản xuất',
    )
    semi_finished_product = models.ForeignKey(
        'SemiFinishedProduct',
        on_delete=models.PROTECT,
        related_name='production_order_items',
        verbose_name='Bán thành phẩm',
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0, verbose_name='Số lượng kế hoạch')
    completed_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0, verbose_name='Số lượng hoàn thành')
    duration_minutes = models.IntegerField(default=0, verbose_name='Thời lượng (phút)')
    notes = models.CharField(max_length=255, blank=True, default='', verbose_name='Ghi chú dòng')

    class Meta:
        ordering = ['id']
        verbose_name = 'Production Order Item'
        verbose_name_plural = 'Production Order Items'

    def __str__(self):
        return f'{self.production_order.code} - {self.semi_finished_product.name}'
