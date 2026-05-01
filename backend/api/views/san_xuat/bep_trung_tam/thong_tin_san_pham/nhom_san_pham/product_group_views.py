"""
Product Group views - Bếp trung tâm > Quản lý danh mục > Nhóm sản phẩm
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import ProductGroup, Product
from api.serializers import ProductGroupSerializer, ProductGroupCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_group_list(request):
    """GET /api/product-groups/ — danh sách | POST /api/product-groups/ — tạo mới."""

    ctx = {'request': request}

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        qs = ProductGroup.objects.all()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        
        ordering = request.query_params.get('ordering', '').strip()
        ALLOWED = {'code', '-code', 'name', '-name', 'status', '-status'}
        if ordering in ALLOWED:
            qs = qs.order_by(ordering)
        
        serializer = ProductGroupSerializer(qs, many=True, context=ctx)
        return Response({'product_groups': serializer.data, 'total': qs.count()})

    # POST — tạo mới
    serializer = ProductGroupCreateSerializer(data=request.data, context=ctx)
    if serializer.is_valid():
        group = serializer.save()
        return Response(
            ProductGroupSerializer(group, context=ctx).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_group_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/product-groups/{pk}/"""
    try:
        group = ProductGroup.objects.get(pk=pk)
    except ProductGroup.DoesNotExist:
        return Response(
            {'detail': 'Không tìm thấy nhóm sản phẩm.'},
            status=status.HTTP_404_NOT_FOUND
        )

    ctx = {'request': request}

    if request.method == 'GET':
        return Response(ProductGroupSerializer(group, context=ctx).data)

    if request.method in ('PUT', 'PATCH'):
        partial = (request.method == 'PATCH')
        serializer = ProductGroupCreateSerializer(
            group,
            data=request.data,
            partial=partial,
            context=ctx
        )
        if serializer.is_valid():
            updated = serializer.save()
            return Response(ProductGroupSerializer(updated, context=ctx).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    linked_products = Product.objects.filter(group=group).count()
    if linked_products > 0:
        return Response(
            {
                'detail': (
                    f'Nhóm sản phẩm này đang được liên kết với {linked_products} sản phẩm. '
                    'Vui lòng cập nhật hoặc xóa sản phẩm trước.'
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    group.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
