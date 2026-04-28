import json
import logging
import re
import unicodedata
from collections import defaultdict
from datetime import timedelta
from functools import lru_cache
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

from .models import Customer, Material, Order, Product, PurchaseOrder, RawMaterial, Supplier
from .serializers import (
    CustomerSerializer, MaterialSerializer, MaterialWriteSerializer,
    OrderSerializer, PhoneLoginSerializer,
    ProductSerializer, ProductCreateSerializer, RawMaterialSerializer,
    PurchaseOrderSerializer, PurchaseOrderWriteSerializer, SupplierSerializer,
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
                'name':     user.full_name or user.phone_number,
                'phone':    user.phone_number,
                'role':     user.role,
                'is_staff': user.is_staff,
            },
        })


# ─── Dashboard ────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    now = timezone.localtime()
    today = now.date()
    yesterday = today - timedelta(days=1)

    valid_statuses = [Order.STATUS_CONFIRMED, Order.STATUS_DELIVERED]

    orders_today_qs = Order.objects.filter(created_at__date=today)
    revenue_today = int(
        orders_today_qs.filter(status__in=valid_statuses).aggregate(total=Sum('total'))['total'] or 0
    )
    orders_today = orders_today_qs.count()

    orders_yesterday = Order.objects.filter(created_at__date=yesterday).count()
    revenue_yesterday = int(
        Order.objects.filter(created_at__date=yesterday, status__in=valid_statuses)
        .aggregate(total=Sum('total'))['total'] or 0
    )

    revenue_growth = (
        ((revenue_today - revenue_yesterday) / revenue_yesterday) * 100
        if revenue_yesterday
        else (100 if revenue_today > 0 else 0)
    )
    orders_growth = (
        ((orders_today - orders_yesterday) / orders_yesterday) * 100
        if orders_yesterday
        else (100 if orders_today > 0 else 0)
    )

    hourly_revenue = defaultdict(int)
    hourly_orders = defaultdict(int)
    hourly_customers = defaultdict(set)
    for order in orders_today_qs.select_related('customer'):
        hour = timezone.localtime(order.created_at).hour
        hourly_orders[hour] += 1
        hourly_customers[hour].add(order.customer_id)
        if order.status in valid_statuses:
            hourly_revenue[hour] += int(order.total or 0)

    chart_hours = [8, 10, 12, 14, 16, 18, 20]
    revenue_by_hour = [
        {
            'hour': f'{h:02d}:00',
            'revenue': hourly_revenue.get(h, 0),
            'orders': hourly_orders.get(h, 0),
            'customers': len(hourly_customers.get(h, set())),
        }
        for h in chart_hours
    ]

    has_peak_data = any(item['revenue'] > 0 for item in revenue_by_hour)
    peak_hour = None
    peak_hour_to = None
    if has_peak_data:
        peak_hour_item = max(
            revenue_by_hour,
            key=lambda x: (x['revenue'], x['orders']),
        )
        peak_hour = peak_hour_item['hour']
        peak_hour_to = f'{(int(peak_hour[:2]) + 2) % 24:02d}:00'

    top_customers_qs = (
        Order.objects.filter(status__in=valid_statuses)
        .values('customer__name', 'customer__address')
        .annotate(total_revenue=Sum('total'))
        .order_by('-total_revenue')[:5]
    )
    top_customers = [
        {
            'name': row['customer__name'] or 'Khách lẻ',
            'province': _extract_province_display(row['customer__address']),
            'revenue': int(row['total_revenue'] or 0),
        }
        for row in top_customers_qs
    ]

    top_products_qs = Product.objects.order_by('-quantity', '-updated_at')[:5]
    top_products = [
        {
            'name': p.name,
            'sold': int(p.quantity or 0),
            'image': request.build_absolute_uri(p.image.url) if p.image else '',
        }
        for p in top_products_qs
    ]

    province_names = _load_province_names()
    province_revenue_map = {idx: 0 for idx in range(1, len(province_names) + 1)}
    province_rows = (
        Order.objects.filter(status__in=valid_statuses)
        .values('customer__address')
        .annotate(total_revenue=Sum('total'))
    )
    for row in province_rows:
        province_match = _detect_province(row['customer__address'])
        if not province_match:
            continue
        province_revenue_map[province_match['province_id']] += int(row['total_revenue'] or 0)

    revenue_by_province = [
        {
            'province_id': idx,
            'province_name': province_names[idx - 1],
            'revenue': province_revenue_map[idx],
        }
        for idx in range(1, len(province_names) + 1)
    ]
    top_provinces = sorted(
        [item for item in revenue_by_province if item['revenue'] > 0],
        key=lambda x: x['revenue'],
        reverse=True,
    )[:5]

    total_revenue_all = int(
        Order.objects.filter(status__in=valid_statuses).aggregate(total=Sum('total'))['total'] or 0
    )
    retail_revenue = int(
        Order.objects.filter(
            status__in=valid_statuses,
            customer__phone__startswith='0',
        ).aggregate(total=Sum('total'))['total'] or 0
    )
    wholesale_revenue = max(total_revenue_all - retail_revenue, 0)
    if total_revenue_all == 0:
        revenue_ratio = {'retail_pct': 0, 'wholesale_pct': 0}
    else:
        revenue_ratio = {
            'retail_pct': round((retail_revenue / total_revenue_all) * 100),
            'wholesale_pct': round((wholesale_revenue / total_revenue_all) * 100),
        }

    channel_counts = {
        'direct': orders_today_qs.filter(customer__phone__startswith='0').count(),
        'grabfood': orders_today_qs.filter(code__icontains='GRAB').count(),
        'shopeefood': orders_today_qs.filter(code__icontains='SHOP').count(),
    }
    total_channels = sum(channel_counts.values())
    if total_channels == 0:
        channel_ratio = {'direct': 0, 'grabfood': 0, 'shopeefood': 0}
    else:
        channel_ratio = {
            key: round((val / total_channels) * 100)
            for key, val in channel_counts.items()
        }

    return Response({
        'total_products': Product.objects.count(),
        'active_products': Product.objects.filter(status=Product.STATUS_ACTIVE).count(),
        'revenue_today': revenue_today,
        'orders_today': orders_today,
        'kpis': {
            'new_orders': orders_today,
            'new_orders_growth_pct': round(orders_growth),
            'revenue': revenue_today,
            'revenue_growth_pct': round(revenue_growth),
            'peak_hour_from': peak_hour,
            'peak_hour_to': peak_hour_to,
            'work_status': None,
        },
        'revenue_by_hour': revenue_by_hour,
        'revenue_ratio': revenue_ratio,
        'top_customers': top_customers,
        'top_products': top_products,
        'revenue_by_province': revenue_by_province,
        'top_provinces': top_provinces,
        'customer_flow': [
            {'hour': item['hour'], 'customers': item['customers']}
            for item in revenue_by_hour
        ],
        'sales_channels': channel_ratio,
    })


@lru_cache(maxsize=1)
def _load_province_names():
    provinces_file = Path(__file__).resolve().parents[2] / 'vietnam-provinces.json'
    if not provinces_file.exists():
        return []
    try:
        payload = json.loads(provinces_file.read_text(encoding='utf-8'))
    except (json.JSONDecodeError, OSError):
        return []
    return [item.get('name', '').strip() for item in payload if item.get('name')]


def _normalize_text(value):
    if not value:
        return ''
    normalized = unicodedata.normalize('NFD', str(value).lower())
    normalized = ''.join(ch for ch in normalized if unicodedata.category(ch) != 'Mn')
    normalized = re.sub(r'[^a-z0-9\s]', ' ', normalized)
    return re.sub(r'\s+', ' ', normalized).strip()


def _province_aliases(province_name):
    normalized = _normalize_text(province_name)
    short_name = re.sub(r'^(tinh|thanh pho)\s+', '', normalized).strip()
    aliases = {short_name}
    if ' ' in short_name:
        aliases.add(short_name.replace(' ', ''))
    if province_name.startswith('Thành phố'):
        aliases.add(f'tp {short_name}')
    if 'ho chi minh' in short_name:
        aliases.add('sai gon')
        aliases.add('tp hcm')
        aliases.add('hcm')
    if 'ha noi' in short_name:
        aliases.add('hn')
    if 'ba ria vung tau' in short_name:
        aliases.add('vung tau')
    return aliases


@lru_cache(maxsize=1)
def _province_alias_lookup():
    names = _load_province_names()
    lookup = []
    for index, province_name in enumerate(names, start=1):
        for alias in _province_aliases(province_name):
            lookup.append((alias, index, province_name))
    lookup.sort(key=lambda item: len(item[0]), reverse=True)
    return lookup


def _detect_province(address):
    if not address:
        return None
    normalized_address = _normalize_text(address)
    if not normalized_address:
        return None
    for alias, province_id, province_name in _province_alias_lookup():
        if alias and alias in normalized_address:
            return {
                'province_id': province_id,
                'province_name': province_name,
            }
    return None


def _extract_province_display(address):
    province_match = _detect_province(address)
    if not province_match:
        return 'Khác'
    short_name = re.sub(r'^(Tỉnh|Thành phố)\s+', '', province_match['province_name']).strip()
    return short_name or province_match['province_name']


# ─── Products ─────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_list(request):
    """GET /api/products/ — danh sách | POST /api/products/ — tạo mới."""

    ctx = {'request': request}

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        qs = Product.objects.all()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        serializer = ProductSerializer(qs, many=True, context=ctx)
        return Response({'products': serializer.data, 'total': qs.count()})

    # POST — tạo mới (dùng ProductCreateSerializer để hỗ trợ bom_items)
    serializer = ProductCreateSerializer(data=request.data, context=ctx)
    if serializer.is_valid():
        product = serializer.save()
        return Response(ProductSerializer(product, context=ctx).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/products/{pk}/"""
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Khong tim thay san pham.'}, status=status.HTTP_404_NOT_FOUND)

    ctx = {'request': request}

    if request.method == 'GET':
        return Response(ProductSerializer(product, context=ctx).data)

    if request.method in ('PUT', 'PATCH'):
        partial = (request.method == 'PATCH')
        serializer = ProductCreateSerializer(product, data=request.data, partial=partial, context=ctx)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(ProductSerializer(updated, context=ctx).data)
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


# ─── Raw Materials ────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def raw_material_list(request):
    """GET /api/raw-materials/ — danh sách nguyên liệu cho BOM dropdown."""
    qs = RawMaterial.objects.all()
    return Response({'raw_materials': RawMaterialSerializer(qs, many=True).data})


# ─── Materials (Nguyên vật liệu) ─────────────────────────────────────────────

MATERIAL_ALLOWED_ROLES = {'Nhân viên thu mua', 'Admin'}


def _has_material_access(user):
    """Cho phép admin (is_staff/is_superuser) và các role được chỉ định."""
    if user.is_staff or user.is_superuser:
        return True
    return getattr(user, 'role', '') in MATERIAL_ALLOWED_ROLES


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def material_list(request):
    """GET /api/materials/ — danh sách | POST /api/materials/ — tạo mới."""
    if not _has_material_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    ctx = {'request': request}

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        qs = Material.objects.all()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        serializer = MaterialSerializer(qs, many=True, context=ctx)
        return Response({'materials': serializer.data, 'total': qs.count()})

    serializer = MaterialWriteSerializer(data=request.data, context=ctx)
    if serializer.is_valid():
        material = serializer.save()
        return Response(MaterialSerializer(material, context=ctx).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def material_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/materials/{pk}/"""
    if not _has_material_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        material = Material.objects.get(pk=pk)
    except Material.DoesNotExist:
        return Response({'detail': 'Khong tim thay nguyen vat lieu.'}, status=status.HTTP_404_NOT_FOUND)

    ctx = {'request': request}

    if request.method == 'GET':
        return Response(MaterialSerializer(material, context=ctx).data)

    if request.method in ('PUT', 'PATCH'):
        partial = (request.method == 'PATCH')
        serializer = MaterialWriteSerializer(material, data=request.data, partial=partial, context=ctx)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(MaterialSerializer(updated, context=ctx).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    material.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


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


# ─── Suppliers ────────────────────────────────────────────────────────────────

PURCHASE_ALLOWED_ROLES = {'Nhân viên thu mua', 'Admin'}


def _has_purchase_access(user):
    if user.is_staff or user.is_superuser:
        return True
    return getattr(user, 'role', '') in PURCHASE_ALLOWED_ROLES


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def supplier_list(request):
    """GET /api/suppliers/ | POST /api/suppliers/"""
    if not _has_purchase_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        qs = Supplier.objects.all()
        if search:
            qs = qs.filter(name__icontains=search)
        return Response({'suppliers': SupplierSerializer(qs, many=True).data, 'total': qs.count()})

    serializer = SupplierSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── PurchaseOrders ───────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def purchase_order_list(request):
    """GET /api/purchase-orders/ | POST /api/purchase-orders/"""
    if not _has_purchase_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        qs = PurchaseOrder.objects.select_related('supplier').all()
        if search:
            qs = qs.filter(code__icontains=search) | qs.filter(supplier__name__icontains=search)
        if status_filter:
            qs = qs.filter(status=status_filter)
        serializer = PurchaseOrderSerializer(qs, many=True)
        return Response({'purchase_orders': serializer.data, 'total': qs.count()})

    serializer = PurchaseOrderWriteSerializer(data=request.data)
    if serializer.is_valid():
        po = serializer.save()
        return Response(PurchaseOrderSerializer(po).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def purchase_order_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/purchase-orders/{pk}/"""
    if not _has_purchase_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        po = PurchaseOrder.objects.select_related('supplier').get(pk=pk)
    except PurchaseOrder.DoesNotExist:
        return Response({'detail': 'Khong tim thay phieu dat hang.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(PurchaseOrderSerializer(po).data)

    if request.method in ('PUT', 'PATCH'):
        partial = (request.method == 'PATCH')
        serializer = PurchaseOrderWriteSerializer(po, data=request.data, partial=partial)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(PurchaseOrderSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    po.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
