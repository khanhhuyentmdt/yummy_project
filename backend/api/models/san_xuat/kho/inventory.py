from django.db import models
from django.utils import timezone


class MaterialInventory(models.Model):
    """Theo doi ton kho nguyen vat lieu theo tung nguyen vat lieu."""

    material = models.OneToOneField(
        'Material',
        on_delete=models.CASCADE,
        related_name='inventory',
        verbose_name='Nguyen vat lieu',
    )
    quantity = models.DecimalField(
        max_digits=14, decimal_places=3, default=0,
        verbose_name='So luong ton hien tai',
    )
    min_quantity = models.DecimalField(
        max_digits=14, decimal_places=3, default=5,
        verbose_name='Dinh muc ton kho toi thieu',
    )
    near_expiry_days = models.PositiveIntegerField(
        default=14,
        verbose_name='Nguong canh bao can date (ngay)',
    )
    expiry_date = models.DateField(
        null=True, blank=True,
        verbose_name='Han su dung',
    )
    unit_cost = models.DecimalField(
        max_digits=14, decimal_places=0, default=0,
        verbose_name='Don gia nhap (de tinh tong gia tri)',
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-material__id']
        verbose_name = 'MaterialInventory'

    def __str__(self):
        return f'Inventory: {self.material.code}'

    # ─── Computed status ──────────────────────────────────────────────────────

    STATUS_HET_HAN      = 'het_han'
    STATUS_CAN_DATE     = 'can_date'
    STATUS_HET_HANG     = 'het_hang'
    STATUS_SAP_HET_HANG = 'sap_het_hang'
    STATUS_CON_HANG     = 'con_hang'

    def get_inventory_status(self):
        today = timezone.now().date()

        # Priority 1: expired (even if still has quantity)
        if self.expiry_date and self.expiry_date < today:
            return self.STATUS_HET_HAN

        # Priority 2: near expiry
        if self.expiry_date:
            from datetime import timedelta
            near_threshold = today + timedelta(days=self.near_expiry_days)
            if self.expiry_date <= near_threshold:
                return self.STATUS_CAN_DATE

        # Priority 3: out of stock
        if self.quantity == 0:
            return self.STATUS_HET_HANG

        # Priority 4: low stock
        if self.quantity <= self.min_quantity:
            return self.STATUS_SAP_HET_HANG

        return self.STATUS_CON_HANG

    def get_total_value(self):
        from decimal import Decimal
        return (Decimal(str(self.quantity)) * Decimal(str(self.unit_cost))).quantize(Decimal('1'))
