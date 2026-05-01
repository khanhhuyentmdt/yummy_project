from django.db import models


class ProductionAcceptance(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_ACCEPTED = 'accepted'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Lưu nháp'),
        (STATUS_ACCEPTED, 'Đã nghiệm thu'),
        (STATUS_REJECTED, 'Từ chối'),
    ]

    code = models.CharField(max_length=20, unique=True, verbose_name='Mã phiếu nghiệm thu')
    name = models.CharField(max_length=200, verbose_name='Tên phiếu nghiệm thu')
    production_order = models.ForeignKey(
        'ProductionOrder',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='acceptances',
        verbose_name='Lệnh sản xuất',
    )
    accepted_date = models.DateField(null=True, blank=True, verbose_name='Ngày nghiệm thu')
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
        verbose_name = 'Production Acceptance'
        verbose_name_plural = 'Production Acceptances'

    def __str__(self):
        return f'{self.code} - {self.name}'


class ProductionAcceptanceItem(models.Model):
    production_acceptance = models.ForeignKey(
        'ProductionAcceptance',
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Phiếu nghiệm thu',
    )
    semi_finished_product = models.ForeignKey(
        'SemiFinishedProduct',
        on_delete=models.PROTECT,
        related_name='production_acceptance_items',
        verbose_name='Bán thành phẩm',
    )
    planned_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0, verbose_name='Số lượng kế hoạch')
    accepted_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0, verbose_name='Số lượng nghiệm thu')
    notes = models.CharField(max_length=255, blank=True, default='', verbose_name='Ghi chú dòng')

    class Meta:
        ordering = ['id']
        verbose_name = 'Production Acceptance Item'
        verbose_name_plural = 'Production Acceptance Items'

    def __str__(self):
        return f'{self.production_acceptance.code} - {self.semi_finished_product.name}'
