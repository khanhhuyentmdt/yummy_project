from django.contrib.auth import authenticate
from rest_framework import serializers


class PhoneLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    password     = serializers.CharField(write_only=True)

    def validate(self, data):
        # Django's authenticate() uses USERNAME_FIELD automatically
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
