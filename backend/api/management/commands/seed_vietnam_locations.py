from django.core.management.base import BaseCommand
from api.models import Province, District, Ward


class Command(BaseCommand):
    help = 'Seed Vietnam provinces, districts, and wards'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Vietnam locations...')
        
        # Sample data - Một số tỉnh/thành phố chính
        provinces_data = [
            {'code': '01', 'name': 'Hà Nội', 'full_name': 'Thành phố Hà Nội', 'code_name': 'ha_noi'},
            {'code': '79', 'name': 'Hồ Chí Minh', 'full_name': 'Thành phố Hồ Chí Minh', 'code_name': 'ho_chi_minh'},
            {'code': '48', 'name': 'Đà Nẵng', 'full_name': 'Thành phố Đà Nẵng', 'code_name': 'da_nang'},
            {'code': '31', 'name': 'Hải Phòng', 'full_name': 'Thành phố Hải Phòng', 'code_name': 'hai_phong'},
            {'code': '92', 'name': 'Cần Thơ', 'full_name': 'Thành phố Cần Thơ', 'code_name': 'can_tho'},
        ]
        
        # Districts for Hà Nội
        hanoi_districts = [
            {'code': '001', 'name': 'Ba Đình', 'full_name': 'Quận Ba Đình', 'province_code': '01'},
            {'code': '002', 'name': 'Hoàn Kiếm', 'full_name': 'Quận Hoàn Kiếm', 'province_code': '01'},
            {'code': '003', 'name': 'Tây Hồ', 'full_name': 'Quận Tây Hồ', 'province_code': '01'},
            {'code': '004', 'name': 'Long Biên', 'full_name': 'Quận Long Biên', 'province_code': '01'},
            {'code': '005', 'name': 'Cầu Giấy', 'full_name': 'Quận Cầu Giấy', 'province_code': '01'},
            {'code': '006', 'name': 'Đống Đa', 'full_name': 'Quận Đống Đa', 'province_code': '01'},
            {'code': '007', 'name': 'Hai Bà Trưng', 'full_name': 'Quận Hai Bà Trưng', 'province_code': '01'},
            {'code': '008', 'name': 'Hoàng Mai', 'full_name': 'Quận Hoàng Mai', 'province_code': '01'},
            {'code': '009', 'name': 'Thanh Xuân', 'full_name': 'Quận Thanh Xuân', 'province_code': '01'},
        ]
        
        # Districts for Hồ Chí Minh
        hcm_districts = [
            {'code': '760', 'name': 'Quận 1', 'full_name': 'Quận 1', 'province_code': '79'},
            {'code': '761', 'name': 'Quận 2', 'full_name': 'Quận 2', 'province_code': '79'},
            {'code': '762', 'name': 'Quận 3', 'full_name': 'Quận 3', 'province_code': '79'},
            {'code': '763', 'name': 'Quận 4', 'full_name': 'Quận 4', 'province_code': '79'},
            {'code': '764', 'name': 'Quận 5', 'full_name': 'Quận 5', 'province_code': '79'},
            {'code': '765', 'name': 'Quận 6', 'full_name': 'Quận 6', 'province_code': '79'},
            {'code': '766', 'name': 'Quận 7', 'full_name': 'Quận 7', 'province_code': '79'},
            {'code': '767', 'name': 'Quận 8', 'full_name': 'Quận 8', 'province_code': '79'},
            {'code': '768', 'name': 'Quận 9', 'full_name': 'Quận 9', 'province_code': '79'},
            {'code': '769', 'name': 'Quận 10', 'full_name': 'Quận 10', 'province_code': '79'},
            {'code': '770', 'name': 'Quận 11', 'full_name': 'Quận 11', 'province_code': '79'},
            {'code': '771', 'name': 'Quận 12', 'full_name': 'Quận 12', 'province_code': '79'},
            {'code': '772', 'name': 'Thủ Đức', 'full_name': 'Thành phố Thủ Đức', 'province_code': '79'},
            {'code': '773', 'name': 'Bình Thạnh', 'full_name': 'Quận Bình Thạnh', 'province_code': '79'},
            {'code': '774', 'name': 'Tân Bình', 'full_name': 'Quận Tân Bình', 'province_code': '79'},
            {'code': '775', 'name': 'Tân Phú', 'full_name': 'Quận Tân Phú', 'province_code': '79'},
            {'code': '776', 'name': 'Phú Nhuận', 'full_name': 'Quận Phú Nhuận', 'province_code': '79'},
        ]
        
        # Wards for Quận 1, HCM
        q1_wards = [
            {'code': '26734', 'name': 'Tân Định', 'full_name': 'Phường Tân Định', 'district_code': '760'},
            {'code': '26737', 'name': 'Đa Kao', 'full_name': 'Phường Đa Kao', 'district_code': '760'},
            {'code': '26740', 'name': 'Bến Nghé', 'full_name': 'Phường Bến Nghé', 'district_code': '760'},
            {'code': '26743', 'name': 'Bến Thành', 'full_name': 'Phường Bến Thành', 'district_code': '760'},
            {'code': '26746', 'name': 'Nguyễn Thái Bình', 'full_name': 'Phường Nguyễn Thái Bình', 'district_code': '760'},
            {'code': '26749', 'name': 'Phạm Ngũ Lão', 'full_name': 'Phường Phạm Ngũ Lão', 'district_code': '760'},
            {'code': '26752', 'name': 'Cầu Ông Lãnh', 'full_name': 'Phường Cầu Ông Lãnh', 'district_code': '760'},
            {'code': '26755', 'name': 'Cô Giang', 'full_name': 'Phường Cô Giang', 'district_code': '760'},
            {'code': '26758', 'name': 'Nguyễn Cư Trinh', 'full_name': 'Phường Nguyễn Cư Trinh', 'district_code': '760'},
            {'code': '26761', 'name': 'Cầu Kho', 'full_name': 'Phường Cầu Kho', 'district_code': '760'},
        ]
        
        # Wards for Ba Đình, Hà Nội
        badinh_wards = [
            {'code': '00001', 'name': 'Phúc Xá', 'full_name': 'Phường Phúc Xá', 'district_code': '001'},
            {'code': '00004', 'name': 'Trúc Bạch', 'full_name': 'Phường Trúc Bạch', 'district_code': '001'},
            {'code': '00006', 'name': 'Vĩnh Phúc', 'full_name': 'Phường Vĩnh Phúc', 'district_code': '001'},
            {'code': '00007', 'name': 'Cống Vị', 'full_name': 'Phường Cống Vị', 'district_code': '001'},
            {'code': '00008', 'name': 'Liễu Giai', 'full_name': 'Phường Liễu Giai', 'district_code': '001'},
            {'code': '00010', 'name': 'Nguyễn Trung Trực', 'full_name': 'Phường Nguyễn Trung Trực', 'district_code': '001'},
            {'code': '00013', 'name': 'Quán Thánh', 'full_name': 'Phường Quán Thánh', 'district_code': '001'},
            {'code': '00016', 'name': 'Ngọc Hà', 'full_name': 'Phường Ngọc Hà', 'district_code': '001'},
            {'code': '00019', 'name': 'Điện Biên', 'full_name': 'Phường Điện Biên', 'district_code': '001'},
            {'code': '00022', 'name': 'Đội Cấn', 'full_name': 'Phường Đội Cấn', 'district_code': '001'},
        ]
        
        # Create provinces
        for p_data in provinces_data:
            Province.objects.get_or_create(
                code=p_data['code'],
                defaults={
                    'name': p_data['name'],
                    'full_name': p_data['full_name'],
                    'code_name': p_data['code_name'],
                }
            )
        
        # Create districts
        all_districts = hanoi_districts + hcm_districts
        for d_data in all_districts:
            province = Province.objects.get(code=d_data['province_code'])
            District.objects.get_or_create(
                code=d_data['code'],
                defaults={
                    'name': d_data['name'],
                    'full_name': d_data['full_name'],
                    'province': province,
                    'code_name': d_data['name'].lower().replace(' ', '_'),
                }
            )
        
        # Create wards
        all_wards = q1_wards + badinh_wards
        for w_data in all_wards:
            district = District.objects.get(code=w_data['district_code'])
            Ward.objects.get_or_create(
                code=w_data['code'],
                defaults={
                    'name': w_data['name'],
                    'full_name': w_data['full_name'],
                    'district': district,
                    'code_name': w_data['name'].lower().replace(' ', '_'),
                }
            )
        
        self.stdout.write(self.style.SUCCESS(
            f'Successfully seeded {Province.objects.count()} provinces, '
            f'{District.objects.count()} districts, '
            f'{Ward.objects.count()} wards'
        ))
