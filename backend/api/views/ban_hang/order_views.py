"""
Order views - Bán hàng > Đơn hàng
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Order
from api.serializers import OrderSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list(request):
    """GET /api/orders/ — danh sách đơn hàng"""
    qs = Order.objects.select_related('customer').all()
    serializer = OrderSerializer(qs, many=True)
    return Response({'orders': serializer.data, 'total': qs.count()})
