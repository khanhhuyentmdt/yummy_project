"""
Bonus views - Nhan su > Quan ly luong > Thuong
CRUD API cho Bonus model + BonusHistory audit trail.
"""
from django.db import transaction
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.models import Bonus, BonusHistory
from api.serializers.nhan_su.quan_ly_luong import (
    BonusSerializer,
    BonusWriteSerializer,
)


def _actor(user):
    """Get actor name from user"""
    return getattr(user, 'full_name', '') or getattr(user, 'phone_number', '') or str(user)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bonus_list(request):
    """GET/POST /api/bonuses/"""
    if request.method == 'GET':
        qs = Bonus.objects.prefetch_related('employees', 'history').all()
        
        # Search
        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(code__icontains=search) |
                Q(employees__full_name__icontains=search) |
                Q(employees__code__icontains=search) |
                Q(reason__icontains=search)
            ).distinct()
        
        # Filter by status
        status_filter = request.query_params.get('status', '').strip()
        if status_filter in ('pending', 'paid', 'cancelled'):
            qs = qs.filter(status=status_filter)
        
        # Filter by employee
        employee_id = request.query_params.get('employee_id', '').strip()
        if employee_id:
            qs = qs.filter(employees__id=employee_id)
        
        # Ordering
        ordering = request.query_params.get('ordering', '').strip()
        ALLOWED = {
            'code', '-code',
            'bonus_date', '-bonus_date',
            'total_amount', '-total_amount',
            'status', '-status',
        }
        if ordering in ALLOWED:
            qs = qs.order_by(ordering)
        
        serializer = BonusSerializer(qs, many=True, context={'request': request})
        return Response({'bonuses': serializer.data, 'total': qs.count()})
    
    # POST
    from django.http import QueryDict
    import json
    
    # Convert QueryDict to mutable dict
    if isinstance(request.data, QueryDict):
        data = dict(request.data.lists())
        # Flatten single-value lists
        for key, value in data.items():
            if isinstance(value, list) and len(value) == 1:
                data[key] = value[0]
    else:
        data = dict(request.data)
    
    # Handle employee_ids
    if 'employee_ids' in data:
        emp_ids = data.get('employee_ids')
        if isinstance(emp_ids, str):
            try:
                data['employee_ids'] = json.loads(emp_ids)
            except (json.JSONDecodeError, ValueError):
                data['employee_ids'] = []
        elif isinstance(emp_ids, list):
            data['employee_ids'] = [int(e) for e in emp_ids if str(e).isdigit()]
        else:
            data['employee_ids'] = []
    else:
        data['employee_ids'] = []
    
    serializer = BonusWriteSerializer(data=data)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        bonus = serializer.save(created_by_name=actor_name)
        bonus = Bonus.objects.prefetch_related('employees', 'history').get(pk=bonus.pk)
        return Response(
            BonusSerializer(bonus, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bonus_bulk_delete(request):
    """POST /api/bonuses/bulk-delete/"""
    ids = request.data.get('ids', [])
    if not ids or not isinstance(ids, list):
        return Response(
            {'detail': 'ids phải là danh sách không rỗng.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    with transaction.atomic():
        deleted_count, _ = Bonus.objects.filter(pk__in=ids).delete()
    
    return Response({'deleted': deleted_count})


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def bonus_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/bonuses/<pk>/"""
    try:
        bonus = Bonus.objects.prefetch_related('employees', 'history').get(pk=pk)
    except Bonus.DoesNotExist:
        return Response(
            {'detail': 'Thưởng không tồn tại.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        return Response(BonusSerializer(bonus, context={'request': request}).data)
    
    if request.method == 'DELETE':
        bonus.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # PUT/PATCH
    from django.http import QueryDict
    import json
    
    # Convert QueryDict to mutable dict
    if isinstance(request.data, QueryDict):
        data = dict(request.data.lists())
        # Flatten single-value lists
        for key, value in data.items():
            if isinstance(value, list) and len(value) == 1:
                data[key] = value[0]
    else:
        data = dict(request.data)
    
    # Handle employee_ids
    if 'employee_ids' in data:
        emp_ids = data.get('employee_ids')
        if isinstance(emp_ids, str):
            try:
                data['employee_ids'] = json.loads(emp_ids)
            except (json.JSONDecodeError, ValueError):
                data['employee_ids'] = []
        elif isinstance(emp_ids, list):
            data['employee_ids'] = [int(e) for e in emp_ids if str(e).isdigit()]
        else:
            data['employee_ids'] = []
    
    partial = request.method == 'PATCH'
    serializer = BonusWriteSerializer(bonus, data=data, partial=partial)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        updated = serializer.save(created_by_name=actor_name)
        updated = Bonus.objects.prefetch_related('employees', 'history').get(pk=updated.pk)
        return Response(BonusSerializer(updated, context={'request': request}).data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
