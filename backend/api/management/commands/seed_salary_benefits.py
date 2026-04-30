from django.core.management.base import BaseCommand
from api.models import SalaryType, BenefitsPolicy


class Command(BaseCommand):
    help = 'Seed salary types and benefits policies'

    def handle(self, *args, **options):
        self.stdout.write('Seeding salary types and benefits policies...')
        
        # Salary Types
        salary_types = [
            {'code': 'CD', 'name': 'Cố định', 'description': 'Lương cố định theo tháng'},
            {'code': 'GIO', 'name': 'Theo giờ', 'description': 'Lương tính theo số giờ làm việc'},
            {'code': 'SP', 'name': 'Theo sản phẩm', 'description': 'Lương tính theo số lượng sản phẩm'},
            {'code': 'KPI', 'name': 'Theo KPI', 'description': 'Lương theo hiệu suất công việc'},
        ]
        
        for st_data in salary_types:
            SalaryType.objects.get_or_create(
                code=st_data['code'],
                defaults={
                    'name': st_data['name'],
                    'description': st_data['description'],
                    'is_active': True,
                }
            )
        
        # Benefits Policies
        benefits = [
            {'code': 'MPL001', 'name': 'Quà sinh nhật', 'description': 'Quà tặng sinh nhật cho nhân viên'},
            {'code': 'MPL002', 'name': 'Phụ cấp ăn trưa', 'description': 'Hỗ trợ chi phí ăn trưa'},
            {'code': 'MPL003', 'name': 'Tết Nguyên Đán', 'description': 'Thưởng Tết Nguyên Đán'},
            {'code': 'MPL004', 'name': 'Phụ cấp năng lực quản lý', 'description': 'Phụ cấp cho vị trí quản lý'},
            {'code': 'MPL005', 'name': 'Bảo hiểm y tế', 'description': 'Bảo hiểm y tế cho nhân viên'},
            {'code': 'MPL006', 'name': 'Bảo hiểm xã hội', 'description': 'Bảo hiểm xã hội theo quy định'},
            {'code': 'MPL007', 'name': 'Phụ cấp đi lại', 'description': 'Hỗ trợ chi phí đi lại'},
            {'code': 'MPL008', 'name': 'Thưởng hiệu suất', 'description': 'Thưởng theo hiệu suất công việc'},
        ]
        
        for b_data in benefits:
            BenefitsPolicy.objects.get_or_create(
                code=b_data['code'],
                defaults={
                    'name': b_data['name'],
                    'description': b_data['description'],
                    'is_active': True,
                }
            )
        
        self.stdout.write(self.style.SUCCESS(
            f'Successfully seeded {SalaryType.objects.count()} salary types and '
            f'{BenefitsPolicy.objects.count()} benefits policies'
        ))
