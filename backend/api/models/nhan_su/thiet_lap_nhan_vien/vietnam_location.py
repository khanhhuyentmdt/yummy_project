from django.db import models


class Province(models.Model):
    """Tỉnh/Thành phố"""
    code = models.CharField(max_length=10, unique=True, verbose_name='Mã tỉnh')
    name = models.CharField(max_length=100, verbose_name='Tên tỉnh')
    name_en = models.CharField(max_length=100, blank=True, verbose_name='Tên tiếng Anh')
    full_name = models.CharField(max_length=200, verbose_name='Tên đầy đủ')
    code_name = models.CharField(max_length=100, blank=True, verbose_name='Tên không dấu')

    class Meta:
        ordering = ['name']
        verbose_name = 'Province'

    def __str__(self):
        return self.name


class District(models.Model):
    """Quận/Huyện"""
    code = models.CharField(max_length=10, unique=True, verbose_name='Mã quận/huyện')
    name = models.CharField(max_length=100, verbose_name='Tên quận/huyện')
    name_en = models.CharField(max_length=100, blank=True, verbose_name='Tên tiếng Anh')
    full_name = models.CharField(max_length=200, verbose_name='Tên đầy đủ')
    code_name = models.CharField(max_length=100, blank=True, verbose_name='Tên không dấu')
    province = models.ForeignKey(
        Province,
        on_delete=models.CASCADE,
        related_name='districts',
        verbose_name='Tỉnh/Thành phố',
    )

    class Meta:
        ordering = ['name']
        verbose_name = 'District'

    def __str__(self):
        return f'{self.name} - {self.province.name}'


class Ward(models.Model):
    """Phường/Xã"""
    code = models.CharField(max_length=10, unique=True, verbose_name='Mã phường/xã')
    name = models.CharField(max_length=100, verbose_name='Tên phường/xã')
    name_en = models.CharField(max_length=100, blank=True, verbose_name='Tên tiếng Anh')
    full_name = models.CharField(max_length=200, verbose_name='Tên đầy đủ')
    code_name = models.CharField(max_length=100, blank=True, verbose_name='Tên không dấu')
    district = models.ForeignKey(
        District,
        on_delete=models.CASCADE,
        related_name='wards',
        verbose_name='Quận/Huyện',
    )

    class Meta:
        ordering = ['name']
        verbose_name = 'Ward'

    def __str__(self):
        return f'{self.name} - {self.district.name}'


__all__ = ['Province', 'District', 'Ward']
