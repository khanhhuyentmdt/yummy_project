from rest_framework import serializers
from api.models import Supplier


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Supplier
        fields = ['id', 'name', 'phone', 'address', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']
