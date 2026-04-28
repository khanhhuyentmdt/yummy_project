"""
Finance views - Tài chính
Nguồn quỹ, sổ quỹ, công nợ
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def fund_source_list(request):
    """GET/POST /api/fund-sources/ - Nguồn quỹ"""
    # TODO: Implement fund source management
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Quản lý nguồn quỹ'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def cash_book_list(request):
    """GET/POST /api/cash-books/ - Sổ quỹ"""
    # TODO: Implement cash book management
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Quản lý sổ quỹ'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_debt_list(request):
    """GET /api/supplier-debts/ - Công nợ nhà cung cấp"""
    # TODO: Implement supplier debt tracking
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Công nợ nhà cung cấp'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_debt_list(request):
    """GET /api/customer-debts/ - Công nợ khách hàng"""
    # TODO: Implement customer debt tracking
    return Response({
        'message': 'Chức năng đang được phát triển',
        'feature': 'Công nợ khách hàng'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)
