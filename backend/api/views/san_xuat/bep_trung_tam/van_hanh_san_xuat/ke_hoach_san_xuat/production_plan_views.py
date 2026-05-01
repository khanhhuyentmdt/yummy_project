from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import ProductionPlan
from api.serializers import ProductionPlanSerializer, ProductionPlanWriteSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def production_plan_list(request):
    if request.method == 'GET':
        qs = ProductionPlan.objects.all()
        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        ordering = request.query_params.get('ordering', '').strip()

        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        if status_filter:
            statuses = [item.strip() for item in status_filter.split(',') if item.strip()]
            if statuses:
                qs = qs.filter(status__in=statuses)

        allowed_ordering = {
            'code', '-code', 'name', '-name', 'start_date', '-start_date',
            'end_date', '-end_date', 'status', '-status',
        }
        if ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        serializer = ProductionPlanSerializer(qs, many=True)
        return Response({'production_plans': serializer.data, 'total': qs.count()})

    serializer = ProductionPlanWriteSerializer(data=request.data)
    if serializer.is_valid():
        plan = serializer.save()
        return Response(ProductionPlanSerializer(plan).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def production_plan_detail(request, pk):
    try:
        plan = ProductionPlan.objects.get(pk=pk)
    except ProductionPlan.DoesNotExist:
        return Response({'detail': 'Không tìm thấy kế hoạch sản xuất.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ProductionPlanSerializer(plan).data)

    if request.method in ('PUT', 'PATCH'):
        serializer = ProductionPlanWriteSerializer(
            plan,
            data=request.data,
            partial=(request.method == 'PATCH'),
        )
        if serializer.is_valid():
            updated = serializer.save()
            return Response(ProductionPlanSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    plan.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
