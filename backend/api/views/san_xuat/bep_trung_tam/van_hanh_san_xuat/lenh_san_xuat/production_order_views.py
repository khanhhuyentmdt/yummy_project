from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import ProductionOrder
from api.serializers import ProductionOrderSerializer, ProductionOrderWriteSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def production_order_list(request):
    if request.method == 'GET':
        qs = ProductionOrder.objects.all()
        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        plan_id = request.query_params.get('production_plan_id', '').strip()
        order_request_id = request.query_params.get('order_request_id', '').strip()
        ordering = request.query_params.get('ordering', '').strip()

        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        if status_filter:
            statuses = [item.strip() for item in status_filter.split(',') if item.strip()]
            if statuses:
                qs = qs.filter(status__in=statuses)
        if plan_id.isdigit():
            qs = qs.filter(production_plan_id=int(plan_id))
        if order_request_id.isdigit():
            qs = qs.filter(order_request_id=int(order_request_id))

        allowed_ordering = {
            'code', '-code', 'name', '-name', 'start_date', '-start_date',
            'end_date', '-end_date', 'status', '-status',
        }
        if ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        serializer = ProductionOrderSerializer(qs, many=True)
        return Response({'production_orders': serializer.data, 'total': qs.count()})

    serializer = ProductionOrderWriteSerializer(data=request.data)
    if serializer.is_valid():
        production_order = serializer.save()
        return Response(
            ProductionOrderSerializer(production_order).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def production_order_detail(request, pk):
    try:
        production_order = ProductionOrder.objects.get(pk=pk)
    except ProductionOrder.DoesNotExist:
        return Response({'detail': 'Không tìm thấy lệnh sản xuất.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ProductionOrderSerializer(production_order).data)

    if request.method in ('PUT', 'PATCH'):
        serializer = ProductionOrderWriteSerializer(
            production_order,
            data=request.data,
            partial=(request.method == 'PATCH'),
        )
        if serializer.is_valid():
            updated = serializer.save()
            return Response(ProductionOrderSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    production_order.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
