"""
Product views - Bếp trung tâm > Quản lý danh mục > Thông tin sản phẩm
"""
import json
import logging
from pathlib import Path

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Product, ProductGroup
from api.serializers import ProductSerializer, ProductCreateSerializer

logger = logging.getLogger(__name__)

DATA_SYNC_FILE = Path(settings.BASE_DIR).parent / 'data_sync' / 'san-pham' / 'products.json'


def _generate_next_product_group_code():
    groups = ProductGroup.objects.filter(code__regex=r'^NSP\d+$').order_by('-code')
    if not groups.exists():
        return 'NSP001'
    highest_code = groups.first().code
    try:
        number = int(highest_code[3:])
        return f'NSP{number + 1:03d}'
    except (ValueError, IndexError):
        return 'NSP001'


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_list(request):
    """GET /api/products/ — danh sách | POST /api/products/ — tạo mới."""

    ctx = {'request': request}

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        qs = Product.objects.select_related('group').prefetch_related('bom_items__raw_material').all()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search) | qs.filter(group__name__icontains=search)
        ordering = request.query_params.get('ordering', '').strip()
        ORDERING_MAP = {
            'code': 'code',
            '-code': '-code',
            'name': 'name',
            '-name': '-name',
            'group': 'group__name',
            '-group': '-group__name',
            'unit': 'unit',
            '-unit': '-unit',
            'price': 'price',
            '-price': '-price',
            'status': 'status',
            '-status': '-status',
        }
        if ordering in ORDERING_MAP:
            qs = qs.order_by(ORDERING_MAP[ordering])
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
        product = Product.objects.select_related('group').prefetch_related('bom_items__raw_material').get(pk=pk)
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
    Doc data_sync/san-pham/products.json, upsert theo id vao DB.
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

    ALLOWED_FIELDS = {'code', 'name', 'unit', 'quantity', 'price', 'status'}

    for item in items:
        item_id = item.get('id')
        if item_id is None:
            errors.append({'item': item, 'error': 'Thieu truong id'})
            continue

        defaults = {k: v for k, v in item.items() if k in ALLOWED_FIELDS}
        group_name = str(item.get('group') or '').strip()
        group_code = str(item.get('group_code') or '').strip()
        if group_name or group_code:
            group = None
            if group_code:
                group = ProductGroup.objects.filter(code__iexact=group_code).first()
            if not group and group_name:
                group = ProductGroup.objects.filter(name__iexact=group_name).first()
            if not group and group_name:
                group = ProductGroup.objects.create(
                    code=_generate_next_product_group_code(),
                    name=group_name,
                    status=ProductGroup.STATUS_ACTIVE,
                )
            defaults['group'] = group

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
