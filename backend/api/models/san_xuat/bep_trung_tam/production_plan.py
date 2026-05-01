from django.db import models


class ProductionPlan(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_PENDING = 'pending'
    STATUS_SENT = 'sent'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Lưu nháp'),
        (STATUS_PENDING, 'Chờ gửi'),
        (STATUS_SENT, 'Đã gửi hàng'),
        (STATUS_CANCELLED, 'Đã hủy'),
    ]

    code = models.CharField(max_length=20, unique=True, verbose_name='Mã kế hoạch')
    name = models.CharField(max_length=200, verbose_name='Tên kế hoạch')
    order_request = models.ForeignKey(
        'OrderRequest',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='production_plans',
        verbose_name='Yêu cầu đặt hàng',
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
        verbose_name = 'Production Plan'
        verbose_name_plural = 'Production Plans'

    def __str__(self):
        return f'{self.code} - {self.name}'


class ProductionPlanItem(models.Model):
    production_plan = models.ForeignKey(
        'ProductionPlan',
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Kế hoạch sản xuất',
    )
    semi_finished_product = models.ForeignKey(
        'SemiFinishedProduct',
        on_delete=models.PROTECT,
        related_name='production_plan_items',
        verbose_name='Bán thành phẩm',
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0, verbose_name='Số lượng')
    duration_minutes = models.IntegerField(default=0, verbose_name='Thời lượng (phút)')

    class Meta:
        ordering = ['id']
        verbose_name = 'Production Plan Item'
        verbose_name_plural = 'Production Plan Items'

    def __str__(self):
        return f'{self.production_plan.code} - {self.semi_finished_product.name}'
