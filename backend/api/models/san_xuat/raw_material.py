from django.db import models


class RawMaterial(models.Model):
    code       = models.CharField(max_length=20, unique=True, verbose_name='Mã NL')
    name       = models.CharField(max_length=200, verbose_name='Tên nguyên liệu')
    unit       = models.CharField(max_length=50,  verbose_name='ĐVT')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering     = ['name']
        verbose_name = 'RawMaterial'

    def __str__(self):
        return f'{self.code} - {self.name}'
