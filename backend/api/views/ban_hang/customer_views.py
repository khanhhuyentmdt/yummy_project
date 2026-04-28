"""
Customer views - Bán hàng > Khách hàng
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Customer
from api.serializers import CustomerSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def customer_list(request):
    """GET /api/customers/ | POST /api/customers/"""
    if request.method == 'GET':
        qs = Customer.objects.all()
        serializer = CustomerSerializer(qs, many=True)
        return Response({'customers': serializer.data, 'total': qs.count()})

    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
