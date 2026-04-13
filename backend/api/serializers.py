from django.contrib.auth import authenticate
from rest_framework import serializers


class PhoneLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(
        max_length=20,
        error_messages={'required': 'Vui lòng nhập số điện thoại.'},
    )
    password = serializers.CharField(
        write_only=True,
        error_messages={'required': 'Vui lòng nhập mật khẩu.'},
    )

    def validate(self, data):
        user = authenticate(
            request=self.context.get('request'),
            username=data['phone'],
            password=data['password'],
        )
        if not user:
            raise serializers.ValidationError(
                'Số điện thoại hoặc mật khẩu không đúng.'
            )
        if not user.is_active:
            raise serializers.ValidationError('Tài khoản đã bị vô hiệu hóa.')
        data['user'] = user
        return data
