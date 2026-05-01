"""
WorkSchedule + Attendance views - Nhan su > Quan ly cham cong
"""
from django.db import transaction
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.models import WorkSchedule, Attendance
from api.serializers import (
    WorkScheduleSerializer, WorkScheduleWriteSerializer,
    AttendanceSerializer, AttendanceWriteSerializer,
)


def _actor(user):
    return getattr(user, 'full_name', '') or getattr(user, 'phone_number', '') or str(user)


# ─── WorkSchedule ─────────────────────────────────────────────────────────────

def _fresh_schedule(pk):
    return WorkSchedule.objects.select_related('employee', 'work_shift').prefetch_related('history').get(pk=pk)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def schedule_list(request):
    """GET/POST /api/schedules/"""
    if request.method == 'GET':
        qs = WorkSchedule.objects.select_related('employee', 'work_shift').prefetch_related('history').all()

        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(code__icontains=search) |
                Q(employee__full_name__icontains=search) |
                Q(employee__code__icontains=search)
            ).distinct()

        status_filter = request.query_params.get('status', '').strip()
        if status_filter in ('active', 'inactive'):
            qs = qs.filter(status=status_filter)

        employee_id = request.query_params.get('employee_id', '').strip()
        if employee_id.isdigit():
            qs = qs.filter(employee_id=int(employee_id))

        ordering = request.query_params.get('ordering', '-id').strip()
        ALLOWED = {'id', '-id', 'code', '-code', 'start_date', '-start_date'}
        if ordering in ALLOWED:
            qs = qs.order_by(ordering)

        serializer = WorkScheduleSerializer(qs, many=True, context={'request': request})
        return Response({'schedules': serializer.data, 'total': qs.count()})

    # POST
    data = dict(request.data)
    for key, val in list(data.items()):
        if isinstance(val, list) and len(val) == 1:
            data[key] = val[0]

    serializer = WorkScheduleWriteSerializer(data=data)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        with transaction.atomic():
            schedule = serializer.save(actor_name=actor_name)
        return Response(
            WorkScheduleSerializer(_fresh_schedule(schedule.pk), context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedule_bulk_delete(request):
    """POST /api/schedules/bulk-delete/"""
    ids = request.data.get('ids', [])
    if not ids or not isinstance(ids, list):
        return Response({'detail': 'ids phai la danh sach khong rong.'}, status=status.HTTP_400_BAD_REQUEST)
    with transaction.atomic():
        deleted_count, _ = WorkSchedule.objects.filter(pk__in=ids).delete()
    return Response({'deleted': deleted_count})


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def schedule_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/schedules/<pk>/"""
    try:
        schedule = _fresh_schedule(pk)
    except WorkSchedule.DoesNotExist:
        return Response({'detail': 'Lich lam viec khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(WorkScheduleSerializer(schedule, context={'request': request}).data)

    if request.method == 'DELETE':
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    data = dict(request.data)
    for key, val in list(data.items()):
        if isinstance(val, list) and len(val) == 1:
            data[key] = val[0]

    partial = request.method == 'PATCH'
    serializer = WorkScheduleWriteSerializer(schedule, data=data, partial=partial)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        with transaction.atomic():
            updated = serializer.save(actor_name=actor_name)
        return Response(WorkScheduleSerializer(_fresh_schedule(updated.pk), context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Attendance ───────────────────────────────────────────────────────────────

def _fresh_attendance(pk):
    return Attendance.objects.select_related('employee', 'work_shift').prefetch_related('history').get(pk=pk)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def attendance_list(request):
    """GET/POST /api/attendances/"""
    if request.method == 'GET':
        qs = Attendance.objects.select_related('employee', 'work_shift').prefetch_related('history').all()

        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(code__icontains=search) |
                Q(employee__full_name__icontains=search) |
                Q(employee__code__icontains=search)
            ).distinct()

        status_filter = request.query_params.get('status', '').strip()
        if status_filter in ('present', 'absent', 'late', 'early_leave', 'leave'):
            qs = qs.filter(status=status_filter)

        employee_id = request.query_params.get('employee_id', '').strip()
        if employee_id.isdigit():
            qs = qs.filter(employee_id=int(employee_id))

        date_from = request.query_params.get('date_from', '').strip()
        date_to   = request.query_params.get('date_to', '').strip()
        if date_from:
            qs = qs.filter(attendance_date__gte=date_from)
        if date_to:
            qs = qs.filter(attendance_date__lte=date_to)

        ordering = request.query_params.get('ordering', '-id').strip()
        ALLOWED = {'id', '-id', 'code', '-code', 'attendance_date', '-attendance_date'}
        if ordering in ALLOWED:
            qs = qs.order_by(ordering)

        serializer = AttendanceSerializer(qs, many=True, context={'request': request})
        return Response({'attendances': serializer.data, 'total': qs.count()})

    # POST
    data = dict(request.data)
    for key, val in list(data.items()):
        if isinstance(val, list) and len(val) == 1:
            data[key] = val[0]

    serializer = AttendanceWriteSerializer(data=data)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        with transaction.atomic():
            attendance = serializer.save(actor_name=actor_name)
        return Response(
            AttendanceSerializer(_fresh_attendance(attendance.pk), context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def attendance_bulk_delete(request):
    """POST /api/attendances/bulk-delete/"""
    ids = request.data.get('ids', [])
    if not ids or not isinstance(ids, list):
        return Response({'detail': 'ids phai la danh sach khong rong.'}, status=status.HTTP_400_BAD_REQUEST)
    with transaction.atomic():
        deleted_count, _ = Attendance.objects.filter(pk__in=ids).delete()
    return Response({'deleted': deleted_count})


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def attendance_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/attendances/<pk>/"""
    try:
        attendance = _fresh_attendance(pk)
    except Attendance.DoesNotExist:
        return Response({'detail': 'Ban ghi cham cong khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(AttendanceSerializer(attendance, context={'request': request}).data)

    if request.method == 'DELETE':
        attendance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    data = dict(request.data)
    for key, val in list(data.items()):
        if isinstance(val, list) and len(val) == 1:
            data[key] = val[0]

    partial = request.method == 'PATCH'
    serializer = AttendanceWriteSerializer(attendance, data=data, partial=partial)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        with transaction.atomic():
            updated = serializer.save(actor_name=actor_name)
        return Response(AttendanceSerializer(_fresh_attendance(updated.pk), context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
