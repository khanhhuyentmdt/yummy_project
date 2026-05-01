from django.db import models


class SemiFinishedProductBOM(models.Model):
    semi_finished_product = models.ForeignKey(
        'SemiFinishedProduct',
        on_delete=models.CASCADE,
        related_name='bom_items',
        verbose_name='Bán thành phẩm',
    )
    raw_material = models.ForeignKey(
        'RawMaterial',
        on_delete=models.PROTECT,
        related_name='semi_finished_bom_items',
        verbose_name='Nguyên liệu',
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3, verbose_name='Định lượng')
    unit = models.CharField(max_length=50, blank=True, verbose_name='ĐVT')

    class Meta:
        unique_together = [['semi_finished_product', 'raw_material']]
        verbose_name = 'Semi Finished Product BOM'
        verbose_name_plural = 'Semi Finished Product BOMs'

    def __str__(self):
        return f'{self.semi_finished_product.code} - {self.raw_material.name} x{self.quantity}'
