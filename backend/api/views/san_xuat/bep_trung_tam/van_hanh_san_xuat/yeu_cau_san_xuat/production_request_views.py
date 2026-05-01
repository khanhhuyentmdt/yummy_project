from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import ProductionRequest
from api.serializers import ProductionRequestSerializer, ProductionRequestWriteSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def production_request_list(request):
    if request.method == 'GET':
        qs = ProductionRequest.objects.all()
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
            'code', '-code', 'name', '-name', 'request_date', '-request_date',
            'expected_date', '-expected_date', 'status', '-status',
        }
        if ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        serializer = ProductionRequestSerializer(qs, many=True)
        return Response({'production_requests': serializer.data, 'total': qs.count()})

    serializer = ProductionRequestWriteSerializer(data=request.data)
    if serializer.is_valid():
        production_request = serializer.save()
        return Response(
            ProductionRequestSerializer(production_request).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def production_request_detail(request, pk):
    try:
        production_request = ProductionRequest.objects.get(pk=pk)
    except ProductionRequest.DoesNotExist:
        return Response({'detail': 'Không tìm thấy yêu cầu sản xuất.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ProductionRequestSerializer(production_request).data)

    if request.method in ('PUT', 'PATCH'):
        serializer = ProductionRequestWriteSerializer(
            production_request,
            data=request.data,
            partial=(request.method == 'PATCH'),
        )
        if serializer.is_valid():
            updated = serializer.save()
            return Response(ProductionRequestSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    production_request.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
