"""
Bán thành phẩm views - Bếp trung tâm > Quản lý danh mục > Thông tin bán thành phẩm
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import SemiFinishedProduct
from api.serializers import (
    SemiFinishedProductSerializer,
    SemiFinishedProductWriteSerializer,
)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def semi_finished_product_list(request):
    ctx = {'request': request}

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        qs = SemiFinishedProduct.objects.all()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        ordering = request.query_params.get('ordering', '').strip()
        ALLOWED = {
            'code', '-code', 'name', '-name', 'unit', '-unit',
            'price', '-price', 'status', '-status',
        }
        if ordering in ALLOWED:
            qs = qs.order_by(ordering)
        serializer = SemiFinishedProductSerializer(qs, many=True, context=ctx)
        return Response({'semi_finished_products': serializer.data, 'total': qs.count()})

    serializer = SemiFinishedProductWriteSerializer(data=request.data, context=ctx)
    if serializer.is_valid():
        product = serializer.save()
        return Response(
            SemiFinishedProductSerializer(product, context=ctx).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def semi_finished_product_detail(request, pk):
    try:
        product = SemiFinishedProduct.objects.get(pk=pk)
    except SemiFinishedProduct.DoesNotExist:
        return Response(
            {'detail': 'Không tìm thấy bán thành phẩm.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    ctx = {'request': request}

    if request.method == 'GET':
        return Response(SemiFinishedProductSerializer(product, context=ctx).data)

    if request.method in ('PUT', 'PATCH'):
        partial = (request.method == 'PATCH')
        serializer = SemiFinishedProductWriteSerializer(
            product,
            data=request.data,
            partial=partial,
            context=ctx,
        )
        if serializer.is_valid():
            updated = serializer.save()
            return Response(SemiFinishedProductSerializer(updated, context=ctx).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    product.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
