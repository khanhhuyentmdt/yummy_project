"""
Settings views - Cai dat
Thiet lap don vi van chuyen (placeholder)
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def shipping_unit_list(request):
    """GET/POST /api/shipping-units/ - Thiết lập đơn vị vận chuyển"""
    return Response({
        'message': 'Chuc nang dang duoc phat trien',
        'feature': 'Thiet lap don vi van chuyen'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)
