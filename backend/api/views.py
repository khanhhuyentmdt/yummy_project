import json
import logging
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

DATA_SYNC_FILE = Path(settings.BASE_DIR).parent / 'data_sync' / 'products.json'

from .models import Customer, Order, Product
from .serializers import (
    CustomerSerializer, OrderSerializer,
    PhoneLoginSerializer, ProductSerializer,
)

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
    today = timezone.now().date()
    revenue = Order.objects.filter(
        created_at__date=today,
        status__in=[Order.STATUS_CONFIRMED, Order.STATUS_DELIVERED],
    ).aggregate(total=Sum('total'))['total'] or 0

    return Response({
        'total_products':  Product.objects.count(),
        'active_products': Product.objects.filter(status=Product.STATUS_ACTIVE).count(),
        'revenue_today':   int(revenue),
        'orders_today':    Order.objects.filter(created_at__date=today).count(),
    })


# ─── Products ─────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_list(request):
    """GET /api/products/ — danh sách | POST /api/products/ — tạo mới."""

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        qs = Product.objects.all()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        serializer = ProductSerializer(qs, many=True)
        return Response({'products': serializer.data, 'total': qs.count()})

    # POST — tạo mới
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/products/{pk}/"""
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Khong tim thay san pham.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ProductSerializer(product).data)

    if request.method in ('PUT', 'PATCH'):
        partial = (request.method == 'PATCH')
        serializer = ProductSerializer(product, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    product.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def product_sync(request):
    """
    POST /api/products/sync/
    Doc data_sync/products.json, upsert theo id vao DB.
    Tra ve: {updated, created, message}
    """
    if not DATA_SYNC_FILE.exists():
        return Response(
            {'detail': f'Khong tim thay file {DATA_SYNC_FILE}. Hay chay export_products truoc.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        payload = json.loads(DATA_SYNC_FILE.read_text(encoding='utf-8'))
    except (json.JSONDecodeError, OSError) as exc:
        logger.error('product_sync: doc file loi — %s', exc)
        return Response(
            {'detail': f'File JSON khong hop le: {exc}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    items = payload.get('products', [])
    if not isinstance(items, list):
        return Response(
            {'detail': 'File JSON phai co key "products" la mot mang.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    updated = 0
    created = 0
    errors  = []

    ALLOWED_FIELDS = {'code', 'name', 'group', 'unit', 'quantity', 'price', 'status'}

    for item in items:
        item_id = item.get('id')
        if item_id is None:
            errors.append({'item': item, 'error': 'Thieu truong id'})
            continue

        defaults = {k: v for k, v in item.items() if k in ALLOWED_FIELDS}

        try:
            _, is_new = Product.objects.update_or_create(
                id=item_id,
                defaults=defaults,
            )
            if is_new:
                created += 1
            else:
                updated += 1
        except Exception as exc:
            logger.error('product_sync: loi upsert id=%s — %s', item_id, exc)
            errors.append({'id': item_id, 'error': str(exc)})

    message = f'Da cap nhat {updated} ban ghi, da tao moi {created} ban ghi.'
    logger.info('product_sync: %s', message)

    response_data = {
        'updated': updated,
        'created': created,
        'message': message,
    }
    if errors:
        response_data['errors'] = errors

    return Response(response_data)


# ─── Customers ────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def customer_list(request):
    if request.method == 'GET':
        qs = Customer.objects.all()
        serializer = CustomerSerializer(qs, many=True)
        return Response({'customers': serializer.data, 'total': qs.count()})

    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Orders ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list(request):
    qs = Order.objects.select_related('customer').all()
    serializer = OrderSerializer(qs, many=True)
    return Response({'orders': serializer.data, 'total': qs.count()})
