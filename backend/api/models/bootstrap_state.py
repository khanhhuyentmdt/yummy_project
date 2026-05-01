from django.db import models


class BootstrapState(models.Model):
    key = models.CharField(max_length=100, unique=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['key']
        verbose_name = 'Bootstrap State'
        verbose_name_plural = 'Bootstrap States'

    def __str__(self):
        return f'{self.key} ({ "done" if self.is_completed else "pending" })'
