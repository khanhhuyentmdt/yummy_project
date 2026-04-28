"""
Customer views - Bán hàng > Khách hàng > Thông tin khách hàng
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
    """GET/POST /api/customers/"""
    if request.method == 'GET':
        qs = Customer.objects.all()
        serializer = CustomerSerializer(qs, many=True)
        return Response({'customers': serializer.data, 'total': qs.count()})

    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def customer_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/customers/{pk}/"""
    try:
        customer = Customer.objects.get(pk=pk)
    except Customer.DoesNotExist:
        return Response({'detail': 'Không tìm thấy khách hàng.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(CustomerSerializer(customer).data)

    if request.method in ('PUT', 'PATCH'):
        partial = (request.method == 'PATCH')
        serializer = CustomerSerializer(customer, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    customer.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
