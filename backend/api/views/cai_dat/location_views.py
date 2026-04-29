"""
Location views - Thiet lap dia diem
CRUD API cho Location model. Chi Admin moi co quyen truy cap.
staff_user_list: tra danh sach nhan vien cho dropdown.
"""
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.models import Location, LocationHistory
from api.serializers import LocationSerializer, LocationWriteSerializer


def _is_admin(user):
    return user.is_superuser or user.is_staff or getattr(user, 'role', '') == 'Admin'


def _actor(user):
    return user.full_name or user.phone_number


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_user_list(request):
    """GET /api/staff-users/ — danh sach user cho dropdown Nhan vien quan ly"""
    User = get_user_model()
    users = User.objects.filter(is_active=True).order_by('full_name', 'phone_number')
    data = [
        {'id': u.id, 'name': u.full_name or u.phone_number, 'role': u.role}
        for u in users
    ]
    return Response({'users': data})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def location_list(request):
    """GET/POST /api/locations/"""
    if not _is_admin(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        qs = Location.objects.select_related('manager').prefetch_related('history').all()
        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        status_filter = request.query_params.get('status', '').strip()
        if status_filter in ('active', 'inactive'):
            qs = qs.filter(status=status_filter)
        serializer = LocationSerializer(qs, many=True)
        return Response({'locations': serializer.data, 'total': qs.count()})

    # POST
    serializer = LocationWriteSerializer(data=request.data)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        location = serializer.save(created_by_name=actor_name)
        LocationHistory.objects.create(
            location=location,
            actor_name=actor_name,
            action=f'Thêm mới địa điểm {location.code}',
        )
        location = Location.objects.select_related('manager').prefetch_related('history').get(pk=location.pk)
        return Response(LocationSerializer(location).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def location_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/locations/<pk>/"""
    if not _is_admin(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        location = Location.objects.select_related('manager').prefetch_related('history').get(pk=pk)
    except Location.DoesNotExist:
        return Response({'detail': 'Dia diem khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(LocationSerializer(location).data)

    if request.method == 'DELETE':
        location.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    old_status = location.status
    partial = request.method == 'PATCH'
    serializer = LocationWriteSerializer(location, data=request.data, partial=partial)
    if serializer.is_valid():
        updated = serializer.save()
        actor_name = _actor(request.user)
        if old_status != updated.status:
            label = 'Đang hoạt động' if updated.status == 'active' else 'Tạm ngưng'
            action = f'Thay đổi trạng thái thành {label}'
        else:
            action = 'Cập nhật thông tin'
        LocationHistory.objects.create(location=updated, actor_name=actor_name, action=action)
        updated = Location.objects.select_related('manager').prefetch_related('history').get(pk=updated.pk)
        return Response(LocationSerializer(updated).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
