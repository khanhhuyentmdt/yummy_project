"""
Settings views - Cài đặt
Thiết lập địa điểm, đơn vị vận chuyển
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def location_list(request):
    """GET/POST /api/locations/ - Thiết lập địa điểm"""
    # TODO: Implement location management
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Thiết lập địa điểm'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def shipping_unit_list(request):
    """GET/POST /api/shipping-units/ - Thiết lập đơn vị vận chuyển"""
    # TODO: Implement shipping unit management
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Thiết lập đơn vị vận chuyển'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)
