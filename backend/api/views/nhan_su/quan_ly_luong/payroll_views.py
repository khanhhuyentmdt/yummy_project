"""
Payroll views - Nhân sự > Quản lý lương
Thưởng, phúc lợi, bảng lương
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bonus_list(request):
    """GET/POST /api/bonuses/ - Thưởng"""
    # TODO: Implement bonus management
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Quản lý thưởng'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def benefit_list(request):
    """GET/POST /api/benefits/ - Phúc lợi"""
    # TODO: Implement benefit management
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Quản lý phúc lợi'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payroll_list(request):
    """GET/POST /api/payrolls/ - Bảng lương"""
    # TODO: Implement payroll management
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Quản lý bảng lương'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)
