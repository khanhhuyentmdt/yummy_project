"""
Payroll views - Nhan su > Quan ly luong > Bang luong
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payroll_list(request):
    """GET/POST /api/payrolls/ - Bang luong"""
    return Response({
        'message': 'Chuc nang dang duoc phat trien',
        'feature': 'Quan ly bang luong'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)
