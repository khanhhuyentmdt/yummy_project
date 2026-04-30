from rest_framework import serializers
from api.models import Order


class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'code', 'customer', 'customer_name',
            'total', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
