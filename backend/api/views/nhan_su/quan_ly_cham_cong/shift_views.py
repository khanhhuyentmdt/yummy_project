"""
WorkShift views - Nhan su > Quan ly cham cong > Ca lam viec
"""
from django.db import transaction
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.models import WorkShift
from api.serializers import WorkShiftSerializer, WorkShiftWriteSerializer


def _actor(user):
    return getattr(user, 'full_name', '') or getattr(user, 'phone_number', '') or str(user)


def _fresh(pk):
    return WorkShift.objects.prefetch_related('breaks', 'history').get(pk=pk)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def shift_list(request):
    """GET/POST /api/shifts/"""
    if request.method == 'GET':
        qs = WorkShift.objects.prefetch_related('breaks', 'history').all()

        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(code__icontains=search))

        status_filter = request.query_params.get('status', '').strip()
        if status_filter in ('active', 'inactive'):
            qs = qs.filter(status=status_filter)

        ordering = request.query_params.get('ordering', '').strip()
        ALLOWED = {'code', '-code', 'name', '-name', 'status', '-status',
                   'start_time', '-start_time', 'end_time', '-end_time'}
        if ordering in ALLOWED:
            qs = qs.order_by(ordering)

        serializer = WorkShiftSerializer(qs, many=True)
        return Response({'shifts': serializer.data, 'total': qs.count()})

    # POST
    serializer = WorkShiftWriteSerializer(data=request.data)
    if serializer.is_valid():
        shift = serializer.save(actor_name=_actor(request.user))
        return Response(
            WorkShiftSerializer(_fresh(shift.pk)).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shift_bulk_delete(request):
    """POST /api/shifts/bulk-delete/"""
    ids = request.data.get('ids', [])
    if not ids or not isinstance(ids, list):
        return Response(
            {'detail': 'ids phai la danh sach khong rong.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    with transaction.atomic():
        deleted_count, _ = WorkShift.objects.filter(pk__in=ids).delete()
    return Response({'deleted': deleted_count})


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def shift_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/shifts/<pk>/"""
    try:
        shift = WorkShift.objects.prefetch_related('breaks', 'history').get(pk=pk)
    except WorkShift.DoesNotExist:
        return Response({'detail': 'Ca lam viec khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(WorkShiftSerializer(shift).data)

    if request.method == 'DELETE':
        shift.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    partial    = request.method == 'PATCH'
    serializer = WorkShiftWriteSerializer(shift, data=request.data, partial=partial)
    if serializer.is_valid():
        updated = serializer.save(actor_name=_actor(request.user))
        return Response(WorkShiftSerializer(_fresh(updated.pk)).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
