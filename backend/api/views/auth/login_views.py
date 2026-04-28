"""
Authentication views - Login functionality
"""
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from api.serializers import PhoneLoginSerializer


class PhoneLoginView(APIView):
    """POST /api/auth/login/ — đăng nhập bằng phone_number + password."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PhoneLoginSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id':       user.id,
                'name':     user.full_name or user.phone_number,
                'phone':    user.phone_number,
                'role':     user.role,
                'is_staff': user.is_staff,
            },
        })
