from django.db import models


class Customer(models.Model):
    name       = models.CharField(max_length=200, verbose_name='Tên khách hàng')
    phone      = models.CharField(max_length=20,  verbose_name='Số điện thoại')
    email      = models.EmailField(blank=True,     verbose_name='Email')
    address    = models.TextField(blank=True,      verbose_name='Địa chỉ')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering     = ['name']
        verbose_name = 'Customer'

    def __str__(self):
        return self.name
