"""
Vietnam Location views - API cho địa lý Việt Nam
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Province, District, Ward
from api.serializers import ProvinceSerializer, DistrictSerializer, WardSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def province_list(request):
    """GET /api/provinces/ - Danh sách tỉnh/thành phố"""
    provinces = Province.objects.all()
    search = request.query_params.get('search', '').strip()
    if search:
        provinces = provinces.filter(name__icontains=search)
    serializer = ProvinceSerializer(provinces, many=True)
    return Response({'provinces': serializer.data, 'total': provinces.count()})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def district_list(request):
    """GET /api/districts/?province_code=XX - Danh sách quận/huyện theo tỉnh"""
    province_code = request.query_params.get('province_code', '').strip()
    if not province_code:
        return Response({'districts': [], 'total': 0})
    
    districts = District.objects.filter(province__code=province_code).select_related('province')
    search = request.query_params.get('search', '').strip()
    if search:
        districts = districts.filter(name__icontains=search)
    
    serializer = DistrictSerializer(districts, many=True)
    return Response({'districts': serializer.data, 'total': districts.count()})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ward_list(request):
    """GET /api/wards/?district_code=XXX - Danh sách phường/xã theo quận"""
    district_code = request.query_params.get('district_code', '').strip()
    if not district_code:
        return Response({'wards': [], 'total': 0})
    
    wards = Ward.objects.filter(district__code=district_code).select_related('district', 'district__province')
    search = request.query_params.get('search', '').strip()
    if search:
        wards = wards.filter(name__icontains=search)
    
    serializer = WardSerializer(wards, many=True)
    return Response({'wards': serializer.data, 'total': wards.count()})
