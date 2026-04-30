"""
Employee views - Nhan su > Thiet lap nhan vien
CRUD API cho Employee model + EmployeeHistory audit trail.
"""
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.models import Employee, EmployeeHistory
from api.serializers import EmployeeSerializer, EmployeeWriteSerializer


def _actor(user):
    return getattr(user, 'full_name', '') or getattr(user, 'phone_number', '') or str(user)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def employee_list(request):
    """GET/POST /api/employees/"""
    if request.method == 'GET':
        qs = Employee.objects.select_related('work_area', 'salary_type').prefetch_related('history', 'benefits').all()
        search = request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(full_name__icontains=search) |
                Q(code__icontains=search) |
                Q(phone__icontains=search) |
                Q(role__icontains=search)
            )
        status_filter = request.query_params.get('status', '').strip()
        if status_filter in ('working', 'stopped'):
            qs = qs.filter(status=status_filter)
        ordering = request.query_params.get('ordering', '').strip()
        ALLOWED = {
            'code', '-code', 'full_name', '-full_name',
            'role', '-role', 'status', '-status',
            'start_date', '-start_date',
        }
        if ordering in ALLOWED:
            qs = qs.order_by(ordering)
        serializer = EmployeeSerializer(qs, many=True, context={'request': request})
        return Response({'employees': serializer.data, 'total': qs.count()})

    # POST
    import json
    data = request.data.copy()
    
    # Parse benefits_ids if it's a JSON string
    if 'benefits_ids' in data and isinstance(data['benefits_ids'], str):
        try:
            data['benefits_ids'] = json.loads(data['benefits_ids'])
        except (json.JSONDecodeError, ValueError):
            data['benefits_ids'] = []
    
    serializer = EmployeeWriteSerializer(data=data)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        employee   = serializer.save(created_by_name=actor_name)
        employee = Employee.objects.select_related('work_area', 'salary_type').prefetch_related('history', 'benefits').get(pk=employee.pk)
        return Response(
            EmployeeSerializer(employee, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def employee_bulk_delete(request):
    """POST /api/employees/bulk-delete/"""
    ids = request.data.get('ids', [])
    if not ids or not isinstance(ids, list):
        return Response({'detail': 'ids phai la danh sach khong rong.'}, status=status.HTTP_400_BAD_REQUEST)
    with transaction.atomic():
        deleted_count, _ = Employee.objects.filter(pk__in=ids).delete()
    return Response({'deleted': deleted_count})


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def employee_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/employees/<pk>/"""
    try:
        employee = Employee.objects.select_related('work_area', 'salary_type').prefetch_related('history', 'benefits').get(pk=pk)
    except Employee.DoesNotExist:
        return Response({'detail': 'Nhan vien khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(EmployeeSerializer(employee, context={'request': request}).data)

    if request.method == 'DELETE':
        employee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    import json
    data = request.data.copy()
    
    # Parse benefits_ids if it's a JSON string
    if 'benefits_ids' in data and isinstance(data['benefits_ids'], str):
        try:
            data['benefits_ids'] = json.loads(data['benefits_ids'])
        except (json.JSONDecodeError, ValueError):
            data['benefits_ids'] = []
    
    old_status = employee.status
    partial    = request.method == 'PATCH'
    serializer = EmployeeWriteSerializer(employee, data=data, partial=partial)
    if serializer.is_valid():
        updated    = serializer.save()
        updated = Employee.objects.select_related('work_area', 'salary_type').prefetch_related('history', 'benefits').get(pk=updated.pk)
        return Response(EmployeeSerializer(updated, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def employee_role_list(request):
    """GET/POST /api/employee-roles/ — stub"""
    return Response(
        {'message': 'Chuc nang dang duoc phat trien', 'feature': 'Quan ly vai tro nhan vien'},
        status=status.HTTP_501_NOT_IMPLEMENTED,
    )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def employee_account_list(request):
    """GET/POST /api/employee-accounts/ — stub"""
    return Response(
        {'message': 'Chuc nang dang duoc phat trien', 'feature': 'Quan ly tai khoan nhan vien'},
        status=status.HTTP_501_NOT_IMPLEMENTED,
    )
