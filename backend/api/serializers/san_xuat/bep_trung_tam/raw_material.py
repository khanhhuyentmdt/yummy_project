from rest_framework import serializers
from api.models import RawMaterial


class RawMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RawMaterial
        fields = ['id', 'code', 'name', 'unit']
