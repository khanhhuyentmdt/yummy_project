from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import ProductionAcceptance
from api.serializers import ProductionAcceptanceSerializer, ProductionAcceptanceWriteSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def production_acceptance_list(request):
    if request.method == 'GET':
        qs = ProductionAcceptance.objects.all()
        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        production_order_id = request.query_params.get('production_order_id', '').strip()
        ordering = request.query_params.get('ordering', '').strip()

        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        if status_filter:
            statuses = [item.strip() for item in status_filter.split(',') if item.strip()]
            if statuses:
                qs = qs.filter(status__in=statuses)
        if production_order_id.isdigit():
            qs = qs.filter(production_order_id=int(production_order_id))

        allowed_ordering = {
            'code', '-code', 'name', '-name', 'accepted_date', '-accepted_date',
            'status', '-status',
        }
        if ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        serializer = ProductionAcceptanceSerializer(qs, many=True)
        return Response({'production_acceptances': serializer.data, 'total': qs.count()})

    serializer = ProductionAcceptanceWriteSerializer(data=request.data)
    if serializer.is_valid():
        production_acceptance = serializer.save()
        return Response(
            ProductionAcceptanceSerializer(production_acceptance).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def production_acceptance_detail(request, pk):
    try:
        production_acceptance = ProductionAcceptance.objects.get(pk=pk)
    except ProductionAcceptance.DoesNotExist:
        return Response({'detail': 'Không tìm thấy phiếu nghiệm thu sản xuất.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ProductionAcceptanceSerializer(production_acceptance).data)

    if request.method in ('PUT', 'PATCH'):
        serializer = ProductionAcceptanceWriteSerializer(
            production_acceptance,
            data=request.data,
            partial=(request.method == 'PATCH'),
        )
        if serializer.is_valid():
            updated = serializer.save()
            return Response(ProductionAcceptanceSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    production_acceptance.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
