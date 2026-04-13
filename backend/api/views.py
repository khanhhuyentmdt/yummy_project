from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def dashboard_stats(request):
    return Response({
        'total_products': 47,
        'active_products': 38,
        'revenue_today': 12500000,
        'orders_today': 23,
    })


@api_view(['GET'])
def product_list(request):
    products = [
        {'id': 1,  'code': 'HSP011', 'name': 'Trà hồ Khoai môn 3 vị',          'group': 'Trà hồ Singapore', 'unit': 'Lý',   'price': 28000, 'status': 'active'},
        {'id': 2,  'code': 'HSP022', 'name': 'Matcha trà hồ gạo rang đặc 49',   'group': 'Matcha Trà hồ',    'unit': 'Lý',   'price': 30000, 'status': 'inactive'},
        {'id': 3,  'code': 'HSP030', 'name': 'Trà hồ kem tầm Đường đêm',        'group': 'Trà hồ Singapore', 'unit': 'Phần', 'price': 32000, 'status': 'active'},
        {'id': 4,  'code': 'HSP045', 'name': 'Trà hồ Đường trắng',              'group': 'Trà hồ Singapore', 'unit': 'Phần', 'price': 22000, 'status': 'active'},
        {'id': 5,  'code': 'HSP056', 'name': 'Trà hồ sữa xuất',                 'group': 'Trà hồ Singapore', 'unit': 'Phần', 'price': 30000, 'status': 'inactive'},
        {'id': 6,  'code': 'HSP067', 'name': 'Trà xanh hoa nhài',               'group': 'Trà hồ Singapore', 'unit': 'Lý',   'price': 25000, 'status': 'active'},
        {'id': 7,  'code': 'HSP078', 'name': 'Trà ô long sữa tươi',             'group': 'Trà hồ Singapore', 'unit': 'Lý',   'price': 35000, 'status': 'active'},
        {'id': 8,  'code': 'HSP089', 'name': 'Matcha latte nóng',               'group': 'Matcha Trà hồ',    'unit': 'Lý',   'price': 38000, 'status': 'active'},
        {'id': 9,  'code': 'HSP090', 'name': 'Trà đào cam sả',                  'group': 'Trà hồ Singapore', 'unit': 'Lý',   'price': 29000, 'status': 'inactive'},
        {'id': 10, 'code': 'HSP101', 'name': 'Trà vải thiều',                   'group': 'Trà hồ Singapore', 'unit': 'Lý',   'price': 27000, 'status': 'active'},
        {'id': 11, 'code': 'HSP112', 'name': 'Cà phê muối',                     'group': 'Cà phê',           'unit': 'Lý',   'price': 33000, 'status': 'active'},
    ]
    return Response({'products': products, 'total': len(products)})
