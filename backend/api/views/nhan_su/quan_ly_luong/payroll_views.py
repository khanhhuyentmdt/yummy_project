"""
Payroll views - Nhan su > Quan ly luong > Bang luong
"""
import json

from django.db import transaction
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.models import Payroll
from api.serializers.nhan_su.quan_ly_luong import (
    PayrollSerializer,
    PayrollWriteSerializer,
)


def _actor(user):
    return getattr(user, 'full_name', '') or getattr(user, 'phone_number', '') or str(user)


def _parse_request_data(request):
    """
    Normalise request.data into a plain dict suitable for PayrollWriteSerializer.

    Rules:
    - employee_ids  must always be a list of ints (never flattened to a scalar).
    - employee_data must always be a list of dicts.
    - Every other field: if it arrived as a single-element list (QueryDict style)
      unwrap it to a scalar.
    """
    raw = request.data

    # Start with a shallow copy so we can mutate freely.
    if hasattr(raw, 'dict'):
        # QueryDict (multipart / form-encoded)
        data = raw.dict()
        # QueryDict.dict() collapses multi-value keys to the last value, so
        # we need to recover list fields that may have been sent as repeated keys.
        employee_ids_raw = raw.getlist('employee_ids') or raw.get('employee_ids', [])
        employee_data_raw = raw.getlist('employee_data') or raw.get('employee_data', [])
    else:
        # JSON body — already a dict with correct Python types
        data = dict(raw)
        employee_ids_raw = data.pop('employee_ids', [])
        employee_data_raw = data.pop('employee_data', [])

    # Flatten scalar fields that arrived as single-element lists (QueryDict artefact).
    # We do this AFTER extracting the list fields so they are not touched.
    for key, value in list(data.items()):
        if key in ('employee_ids', 'employee_data'):
            continue
        if isinstance(value, list) and len(value) == 1:
            data[key] = value[0]

    # ── Parse employee_ids ────────────────────────────────────────────────────
    if isinstance(employee_ids_raw, str):
        try:
            employee_ids_raw = json.loads(employee_ids_raw)
        except (json.JSONDecodeError, ValueError):
            employee_ids_raw = []

    if isinstance(employee_ids_raw, list):
        data['employee_ids'] = [
            int(x) for x in employee_ids_raw
            if isinstance(x, (int, str)) and str(x).lstrip('-').isdigit()
        ]
    else:
        data['employee_ids'] = []

    # ── Parse employee_data ───────────────────────────────────────────────────
    if isinstance(employee_data_raw, str):
        try:
            employee_data_raw = json.loads(employee_data_raw)
        except (json.JSONDecodeError, ValueError):
            employee_data_raw = []

    data['employee_data'] = employee_data_raw if isinstance(employee_data_raw, list) else []

    return data


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payroll_list(request):
    """GET/POST /api/payrolls/"""
    if request.method == 'GET':
        qs = Payroll.objects.prefetch_related('employee_entries__employee', 'history').all()

        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(code__icontains=search) | Q(name__icontains=search) | Q(period__icontains=search)
            ).distinct()

        status_filter = request.query_params.get('status', '').strip()
        if status_filter in ('draft', 'paying', 'paid', 'cancelled'):
            qs = qs.filter(status=status_filter)

        ordering = request.query_params.get('ordering', '-id').strip()
        ALLOWED = {
            'id', '-id', 'code', '-code', 'name', '-name',
            'period', '-period', 'total_amount', '-total_amount', 'status', '-status',
        }
        if ordering in ALLOWED:
            qs = qs.order_by(ordering)

        serializer = PayrollSerializer(qs, many=True, context={'request': request})
        return Response({'payrolls': serializer.data, 'total': qs.count()})

    # POST — create
    data = _parse_request_data(request)
    serializer = PayrollWriteSerializer(data=data)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        with transaction.atomic():
            payroll = serializer.save(created_by_name=actor_name)
        payroll = Payroll.objects.prefetch_related(
            'employee_entries__employee', 'history'
        ).get(pk=payroll.pk)
        return Response(
            PayrollSerializer(payroll, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payroll_bulk_delete(request):
    """POST /api/payrolls/bulk-delete/"""
    ids = request.data.get('ids', [])
    if not ids or not isinstance(ids, list):
        return Response(
            {'detail': 'ids phải là danh sách không rỗng.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        deleted_count, _ = Payroll.objects.filter(pk__in=ids).delete()

    return Response({'deleted': deleted_count})


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def payroll_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/payrolls/<pk>/"""
    try:
        payroll = Payroll.objects.prefetch_related(
            'employee_entries__employee', 'history'
        ).get(pk=pk)
    except Payroll.DoesNotExist:
        return Response({'detail': 'Bảng lương không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(PayrollSerializer(payroll, context={'request': request}).data)

    if request.method == 'DELETE':
        payroll.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PUT / PATCH
    data = _parse_request_data(request)
    partial = request.method == 'PATCH'
    serializer = PayrollWriteSerializer(payroll, data=data, partial=partial)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        with transaction.atomic():
            updated = serializer.save(created_by_name=actor_name)
        updated = Payroll.objects.prefetch_related(
            'employee_entries__employee', 'history'
        ).get(pk=updated.pk)
        return Response(PayrollSerializer(updated, context={'request': request}).data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
