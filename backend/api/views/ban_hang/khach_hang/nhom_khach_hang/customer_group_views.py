"""
Customer Group views - Bán hàng > Khách hàng > Nhóm khách hàng
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def customer_group_list(request):
    """GET/POST /api/customer-groups/"""
    # TODO: Implement customer group management
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Nhóm khách hàng',
    }, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def customer_group_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/customer-groups/{pk}/"""
    # TODO: Implement customer group detail
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Chi tiết nhóm khách hàng',
    }, status=status.HTTP_501_NOT_IMPLEMENTED)
