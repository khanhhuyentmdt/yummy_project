"""
Dashboard views - Tổng quan / Trang chủ
"""
import json
import re
import unicodedata
from collections import defaultdict
from datetime import timedelta
from functools import lru_cache
from pathlib import Path

from django.db.models import Sum
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Order, Product


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """GET /api/dashboard/ — thống kê tổng quan"""
    now = timezone.localtime()
    today = now.date()
    yesterday = today - timedelta(days=1)

    valid_statuses = [Order.STATUS_CONFIRMED, Order.STATUS_DELIVERED]

    orders_today_qs = Order.objects.filter(created_at__date=today)
    revenue_today = int(
        orders_today_qs.filter(status__in=valid_statuses).aggregate(total=Sum('total'))['total'] or 0
    )
    orders_today = orders_today_qs.count()

    orders_yesterday = Order.objects.filter(created_at__date=yesterday).count()
    revenue_yesterday = int(
        Order.objects.filter(created_at__date=yesterday, status__in=valid_statuses)
        .aggregate(total=Sum('total'))['total'] or 0
    )

    revenue_growth = (
        ((revenue_today - revenue_yesterday) / revenue_yesterday) * 100
        if revenue_yesterday
        else (100 if revenue_today > 0 else 0)
    )
    orders_growth = (
        ((orders_today - orders_yesterday) / orders_yesterday) * 100
        if orders_yesterday
        else (100 if orders_today > 0 else 0)
    )

    hourly_revenue = defaultdict(int)
    hourly_orders = defaultdict(int)
    hourly_customers = defaultdict(set)
    for order in orders_today_qs.select_related('customer'):
        hour = timezone.localtime(order.created_at).hour
        hourly_orders[hour] += 1
        hourly_customers[hour].add(order.customer_id)
        if order.status in valid_statuses:
            hourly_revenue[hour] += int(order.total or 0)

    chart_hours = [8, 10, 12, 14, 16, 18, 20]
    revenue_by_hour = [
        {
            'hour': f'{h:02d}:00',
            'revenue': hourly_revenue.get(h, 0),
            'orders': hourly_orders.get(h, 0),
            'customers': len(hourly_customers.get(h, set())),
        }
        for h in chart_hours
    ]

    has_peak_data = any(item['revenue'] > 0 for item in revenue_by_hour)
    peak_hour = None
    peak_hour_to = None
    if has_peak_data:
        peak_hour_item = max(
            revenue_by_hour,
            key=lambda x: (x['revenue'], x['orders']),
        )
        peak_hour = peak_hour_item['hour']
        peak_hour_to = f'{(int(peak_hour[:2]) + 2) % 24:02d}:00'

    top_customers_qs = (
        Order.objects.filter(status__in=valid_statuses)
        .values('customer__name', 'customer__address')
        .annotate(total_revenue=Sum('total'))
        .order_by('-total_revenue')[:5]
    )
    top_customers = [
        {
            'name': row['customer__name'] or 'Khách lẻ',
            'province': _extract_province_display(row['customer__address']),
            'revenue': int(row['total_revenue'] or 0),
        }
        for row in top_customers_qs
    ]

    top_products_qs = Product.objects.order_by('-quantity', '-updated_at')[:5]
    top_products = [
        {
            'name': p.name,
            'sold': int(p.quantity or 0),
            'image': request.build_absolute_uri(p.image.url) if p.image else '',
        }
        for p in top_products_qs
    ]

    province_names = _load_province_names()
    province_revenue_map = {idx: 0 for idx in range(1, len(province_names) + 1)}
    province_rows = (
        Order.objects.filter(status__in=valid_statuses)
        .values('customer__address')
        .annotate(total_revenue=Sum('total'))
    )
    for row in province_rows:
        province_match = _detect_province(row['customer__address'])
        if not province_match:
            continue
        province_revenue_map[province_match['province_id']] += int(row['total_revenue'] or 0)

    revenue_by_province = [
        {
            'province_id': idx,
            'province_name': province_names[idx - 1],
            'revenue': province_revenue_map[idx],
        }
        for idx in range(1, len(province_names) + 1)
    ]
    top_provinces = sorted(
        [item for item in revenue_by_province if item['revenue'] > 0],
        key=lambda x: x['revenue'],
        reverse=True,
    )[:5]

    total_revenue_all = int(
        Order.objects.filter(status__in=valid_statuses).aggregate(total=Sum('total'))['total'] or 0
    )
    retail_revenue = int(
        Order.objects.filter(
            status__in=valid_statuses,
            customer__phone__startswith='0',
        ).aggregate(total=Sum('total'))['total'] or 0
    )
    wholesale_revenue = max(total_revenue_all - retail_revenue, 0)
    if total_revenue_all == 0:
        revenue_ratio = {'retail_pct': 0, 'wholesale_pct': 0}
    else:
        revenue_ratio = {
            'retail_pct': round((retail_revenue / total_revenue_all) * 100),
            'wholesale_pct': round((wholesale_revenue / total_revenue_all) * 100),
        }

    channel_counts = {
        'direct': orders_today_qs.filter(customer__phone__startswith='0').count(),
        'grabfood': orders_today_qs.filter(code__icontains='GRAB').count(),
        'shopeefood': orders_today_qs.filter(code__icontains='SHOP').count(),
    }
    total_channels = sum(channel_counts.values())
    if total_channels == 0:
        channel_ratio = {'direct': 0, 'grabfood': 0, 'shopeefood': 0}
    else:
        channel_ratio = {
            key: round((val / total_channels) * 100)
            for key, val in channel_counts.items()
        }

    return Response({
        'total_products': Product.objects.count(),
        'active_products': Product.objects.filter(status=Product.STATUS_ACTIVE).count(),
        'revenue_today': revenue_today,
        'orders_today': orders_today,
        'kpis': {
            'new_orders': orders_today,
            'new_orders_growth_pct': round(orders_growth),
            'revenue': revenue_today,
            'revenue_growth_pct': round(revenue_growth),
            'peak_hour_from': peak_hour,
            'peak_hour_to': peak_hour_to,
            'work_status': None,
        },
        'revenue_by_hour': revenue_by_hour,
        'revenue_ratio': revenue_ratio,
        'top_customers': top_customers,
        'top_products': top_products,
        'revenue_by_province': revenue_by_province,
        'top_provinces': top_provinces,
        'customer_flow': [
            {'hour': item['hour'], 'customers': item['customers']}
            for item in revenue_by_hour
        ],
        'sales_channels': channel_ratio,
    })


# ─── Helper functions ─────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_province_names():
    """Load danh sách tỉnh thành từ file JSON"""
    provinces_file = Path(__file__).resolve().parents[4] / 'vietnam-provinces.json'
    if not provinces_file.exists():
        return []
    try:
        payload = json.loads(provinces_file.read_text(encoding='utf-8'))
    except (json.JSONDecodeError, OSError):
        return []
    return [item.get('name', '').strip() for item in payload if item.get('name')]


def _normalize_text(value):
    """Chuẩn hóa text để so sánh"""
    if not value:
        return ''
    normalized = unicodedata.normalize('NFD', str(value).lower())
    normalized = ''.join(ch for ch in normalized if unicodedata.category(ch) != 'Mn')
    normalized = re.sub(r'[^a-z0-9\s]', ' ', normalized)
    return re.sub(r'\s+', ' ', normalized).strip()


def _province_aliases(province_name):
    """Tạo các alias cho tên tỉnh thành"""
    normalized = _normalize_text(province_name)
    short_name = re.sub(r'^(tinh|thanh pho)\s+', '', normalized).strip()
    aliases = {short_name}
    if ' ' in short_name:
        aliases.add(short_name.replace(' ', ''))
    if province_name.startswith('Thành phố'):
        aliases.add(f'tp {short_name}')
    if 'ho chi minh' in short_name:
        aliases.add('sai gon')
        aliases.add('tp hcm')
        aliases.add('hcm')
    if 'ha noi' in short_name:
        aliases.add('hn')
    if 'ba ria vung tau' in short_name:
        aliases.add('vung tau')
    return aliases


@lru_cache(maxsize=1)
def _province_alias_lookup():
    """Tạo lookup table cho province aliases"""
    names = _load_province_names()
    lookup = []
    for index, province_name in enumerate(names, start=1):
        for alias in _province_aliases(province_name):
            lookup.append((alias, index, province_name))
    lookup.sort(key=lambda item: len(item[0]), reverse=True)
    return lookup


def _detect_province(address):
    """Phát hiện tỉnh thành từ địa chỉ"""
    if not address:
        return None
    normalized_address = _normalize_text(address)
    if not normalized_address:
        return None
    for alias, province_id, province_name in _province_alias_lookup():
        if alias and alias in normalized_address:
            return {
                'province_id': province_id,
                'province_name': province_name,
            }
    return None


def _extract_province_display(address):
    """Trích xuất tên tỉnh thành để hiển thị"""
    province_match = _detect_province(address)
    if not province_match:
        return 'Khác'
    short_name = re.sub(r'^(Tỉnh|Thành phố)\s+', '', province_match['province_name']).strip()
    return short_name or province_match['province_name']
