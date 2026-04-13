from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import PhoneLoginSerializer

User = get_user_model()


# ─── Auth ─────────────────────────────────────────────────────────────────────

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
                'name':     user.get_full_name(),
                'phone':    user.phone_number,
                'is_staff': user.is_staff,
            },
        })


# ─── Dashboard ────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    return Response({
        'total_products':  47,
        'active_products': 38,
        'revenue_today':   12500000,
        'orders_today':    23,
    })


# ─── Products ─────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_list(request):
    products = [
        {'id': 1,  'code': 'HSP011', 'name': 'Tra ho Khoai mon 3 vi',          'group': 'Tra ho Singapore', 'unit': 'Ly',   'price': 28000, 'status': 'active'},
        {'id': 2,  'code': 'HSP022', 'name': 'Matcha tra ho gao rang dac 49',   'group': 'Matcha Tra ho',    'unit': 'Ly',   'price': 30000, 'status': 'inactive'},
        {'id': 3,  'code': 'HSP030', 'name': 'Tra ho kem tam Duong dem',        'group': 'Tra ho Singapore', 'unit': 'Phan', 'price': 32000, 'status': 'active'},
        {'id': 4,  'code': 'HSP045', 'name': 'Tra ho Duong trang',              'group': 'Tra ho Singapore', 'unit': 'Phan', 'price': 22000, 'status': 'active'},
        {'id': 5,  'code': 'HSP056', 'name': 'Tra ho sua xuat',                 'group': 'Tra ho Singapore', 'unit': 'Phan', 'price': 30000, 'status': 'inactive'},
        {'id': 6,  'code': 'HSP067', 'name': 'Tra xanh hoa nhai',               'group': 'Tra ho Singapore', 'unit': 'Ly',   'price': 25000, 'status': 'active'},
        {'id': 7,  'code': 'HSP078', 'name': 'Tra o long sua tuoi',             'group': 'Tra ho Singapore', 'unit': 'Ly',   'price': 35000, 'status': 'active'},
        {'id': 8,  'code': 'HSP089', 'name': 'Matcha latte nong',               'group': 'Matcha Tra ho',    'unit': 'Ly',   'price': 38000, 'status': 'active'},
        {'id': 9,  'code': 'HSP090', 'name': 'Tra dao cam sa',                  'group': 'Tra ho Singapore', 'unit': 'Ly',   'price': 29000, 'status': 'inactive'},
        {'id': 10, 'code': 'HSP101', 'name': 'Tra vai thieu',                   'group': 'Tra ho Singapore', 'unit': 'Ly',   'price': 27000, 'status': 'active'},
        {'id': 11, 'code': 'HSP112', 'name': 'Ca phe muoi',                     'group': 'Ca phe',           'unit': 'Ly',   'price': 33000, 'status': 'active'},
    ]
    return Response({'products': products, 'total': len(products)})
