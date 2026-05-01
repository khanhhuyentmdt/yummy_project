from django.db import models


class OrderRequest(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Lưu nháp'),
        (STATUS_PENDING, 'Chờ xử lý'),
        (STATUS_APPROVED, 'Đã duyệt'),
        (STATUS_CANCELLED, 'Đã hủy'),
    ]

    code = models.CharField(max_length=20, unique=True, verbose_name='Mã yêu cầu đặt hàng')
    name = models.CharField(max_length=200, verbose_name='Tên yêu cầu đặt hàng')
    request_date = models.DateField(null=True, blank=True, verbose_name='Ngày yêu cầu')
    expected_date = models.DateField(null=True, blank=True, verbose_name='Ngày mong muốn')
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
        verbose_name = 'Order Request'
        verbose_name_plural = 'Order Requests'

    def __str__(self):
        return f'{self.code} - {self.name}'


class OrderRequestItem(models.Model):
    order_request = models.ForeignKey(
        'OrderRequest',
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Yêu cầu đặt hàng',
    )
    semi_finished_product = models.ForeignKey(
        'SemiFinishedProduct',
        on_delete=models.PROTECT,
        related_name='order_request_items',
        verbose_name='Bán thành phẩm',
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0, verbose_name='Số lượng')
    notes = models.CharField(max_length=255, blank=True, default='', verbose_name='Ghi chú dòng')

    class Meta:
        ordering = ['id']
        verbose_name = 'Order Request Item'
        verbose_name_plural = 'Order Request Items'

    def __str__(self):
        return f'{self.order_request.code} - {self.semi_finished_product.name}'
