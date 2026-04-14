from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Customer, Order, Product


# ─── Auth ─────────────────────────────────────────────────────────────────────

class PhoneLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    password     = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            request=self.context.get('request'),
            username=data['phone_number'],
            password=data['password'],
        )
        if not user:
            raise serializers.ValidationError(
                'So dien thoai hoac mat khau khong dung.'
            )
        if not user.is_active:
            raise serializers.ValidationError('Tai khoan da bi vo hieu hoa.')
        data['user'] = user
        return data


# ─── Product ──────────────────────────────────────────────────────────────────

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Product
        fields = [
            'id', 'code', 'name', 'group', 'unit',
            'quantity', 'price', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ─── Customer ─────────────────────────────────────────────────────────────────

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Customer
        fields = ['id', 'name', 'phone', 'email', 'address', 'created_at']
        read_only_fields = ['id', 'created_at']


# ─── Order ────────────────────────────────────────────────────────────────────

class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'code', 'customer', 'customer_name',
            'total', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
