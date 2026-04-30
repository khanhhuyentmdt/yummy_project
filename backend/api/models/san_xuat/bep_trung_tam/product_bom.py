from django.db import models


class ProductBOM(models.Model):
    product      = models.ForeignKey(
        'Product', on_delete=models.CASCADE, related_name='bom_items',
        verbose_name='Sản phẩm',
    )
    raw_material = models.ForeignKey(
        'RawMaterial', on_delete=models.PROTECT, related_name='bom_items',
        verbose_name='Nguyên liệu',
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3, verbose_name='Định lượng')
    unit     = models.CharField(max_length=50, blank=True, verbose_name='ĐVT')

    class Meta:
        unique_together = [['product', 'raw_material']]
        verbose_name    = 'ProductBOM'

    def __str__(self):
        return f'{self.product.code} - {self.raw_material.name} x{self.quantity}'
