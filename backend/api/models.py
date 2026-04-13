from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager — dùng phone_number thay cho username."""

    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('Phone number is required.')
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractUser):
    """Custom User — phone_number là định danh chính, không có username."""

    username   = None  # Xóa trường username của AbstractUser
    phone_number = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Phone number',
    )
    full_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Full name',
    )

    objects = UserManager()

    USERNAME_FIELD  = 'phone_number'
    REQUIRED_FIELDS = []          # Không yêu cầu thêm field nào khi create_superuser

    class Meta:
        verbose_name        = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.full_name or self.phone_number

    def get_full_name(self):
        return self.full_name or self.phone_number
