"""
Salary & Benefits views - API cho loại lương và phúc lợi
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import SalaryType, BenefitsPolicy
from api.serializers import SalaryTypeSerializer, BenefitsPolicySerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salary_type_list(request):
    """GET /api/salary-types/ - Danh sách loại lương"""
    salary_types = SalaryType.objects.filter(is_active=True)
    search = request.query_params.get('search', '').strip()
    if search:
        from django.db.models import Q
        salary_types = salary_types.filter(
            Q(name__icontains=search) | Q(code__icontains=search)
        )
    serializer = SalaryTypeSerializer(salary_types, many=True)
    return Response({'salary_types': serializer.data, 'total': salary_types.count()})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def benefits_policy_list(request):
    """GET /api/benefits-policies/ - Danh sách chính sách phúc lợi"""
    benefits = BenefitsPolicy.objects.filter(is_active=True)
    search = request.query_params.get('search', '').strip()
    if search:
        from django.db.models import Q
        benefits = benefits.filter(
            Q(name__icontains=search) | Q(code__icontains=search)
        )
    serializer = BenefitsPolicySerializer(benefits, many=True)
    return Response({'benefits': serializer.data, 'total': benefits.count()})
