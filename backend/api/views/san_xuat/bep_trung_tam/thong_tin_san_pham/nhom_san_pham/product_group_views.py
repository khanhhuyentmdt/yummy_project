"""
Product Group views - Bếp trung tâm > Thông tin sản phẩm > Nhóm sản phẩm
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_group_list(request):
    """GET/POST /api/product-groups/ - Danh sách nhóm sản phẩm"""
    # TODO: Implement product group management
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Nhóm sản phẩm'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_group_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/product-groups/{pk}/"""
    # TODO: Implement product group detail
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Chi tiết nhóm sản phẩm'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)
