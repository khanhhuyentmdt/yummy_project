import json
from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import (
    BootstrapState,
    Material,
    MaterialGroup,
    Product,
    ProductGroup,
    ProductBOM,
    RawMaterial,
    SemiFinishedProduct,
    SemiFinishedProductBOM,
)


DATA_SYNC_DIR = Path(settings.BASE_DIR).parent / 'data_sync'
PRODUCTION_DEFAULTS_KEY = 'production-default-data-v1'


def _read_json(relative_path, root_key):
    file_path = DATA_SYNC_DIR / relative_path
    payload = json.loads(file_path.read_text(encoding='utf-8-sig'))
    data = payload.get(root_key, [])
    return data if isinstance(data, list) else []


def _next_group_code(model, prefix):
    rows = model.objects.filter(code__regex=rf'^{prefix}\d+$').order_by('-code')
    if not rows.exists():
        return f'{prefix}001'
    highest_code = rows.first().code
    try:
        number = int(highest_code[len(prefix):])
        return f'{prefix}{number + 1:03d}'
    except (ValueError, IndexError):
        return f'{prefix}001'


def _seed_product_groups():
    items = _read_json(Path('san-pham') / 'product-groups.json', 'product_groups')
    count = 0
    for item in items:
        lookup = {'code': item.get('code')} if item.get('code') else {'name': item.get('name')}
        _, created = ProductGroup.objects.update_or_create(
            defaults={
                'code': item.get('code', ''),
                'name': item.get('name', ''),
                'description': item.get('description', ''),
                'status': item.get('status', ProductGroup.STATUS_ACTIVE),
            },
            **lookup,
        )
        count += 1 if created else 0
    return count


def _seed_material_groups():
    items = _read_json(Path('nguyen-vat-lieu') / 'material-groups.json', 'material_groups')
    count = 0
    for item in items:
        lookup = {'code': item.get('code')} if item.get('code') else {'name': item.get('name')}
        _, created = MaterialGroup.objects.update_or_create(
            defaults={
                'code': item.get('code', ''),
                'name': item.get('name', ''),
                'description': item.get('description', ''),
                'status': item.get('status', MaterialGroup.STATUS_ACTIVE),
            },
            **lookup,
        )
        count += 1 if created else 0
    return count


def _seed_materials_and_raw_materials():
    items = _read_json(Path('nguyen-vat-lieu') / 'materials.json', 'materials')
    material_created = 0
    raw_material_created = 0

    for item in items:
        material_lookup = {'id': item.get('id')} if item.get('id') else {'code': item.get('code')}
        _, created_material = Material.objects.update_or_create(
            defaults={
                'code': item.get('code', ''),
                'name': item.get('name', ''),
                'group': item.get('group', ''),
                'unit': item.get('unit', ''),
                'notes': item.get('notes', ''),
                'batch_management': bool(item.get('batch_management', False)),
                'status': item.get('status', Material.STATUS_ACTIVE),
            },
            **material_lookup,
        )
        material_created += 1 if created_material else 0

        raw_lookup = {'id': item.get('id')} if item.get('id') else {'code': item.get('code')}
        _, created_raw = RawMaterial.objects.update_or_create(
            defaults={
                'code': item.get('code', ''),
                'name': item.get('name', ''),
                'unit': item.get('unit', ''),
            },
            **raw_lookup,
        )
        raw_material_created += 1 if created_raw else 0

    return material_created, raw_material_created


def _get_product_group(group_name, group_code=''):
    group_name = str(group_name or '').strip()
    group_code = str(group_code or '').strip()
    if group_code:
        existing = ProductGroup.objects.filter(code__iexact=group_code).first()
        if existing:
            return existing
    if group_name:
        existing = ProductGroup.objects.filter(name__iexact=group_name).first()
        if existing:
            return existing
    if not group_name:
        return None
    return ProductGroup.objects.create(
        code=group_code or _next_group_code(ProductGroup, 'NSP'),
        name=group_name,
        status=ProductGroup.STATUS_ACTIVE,
    )


def _seed_products():
    items = _read_json(Path('san-pham') / 'products.json', 'products')
    product_created = 0

    for item in items:
        group = _get_product_group(item.get('group'), item.get('group_code'))
        lookup = {'id': item.get('id')} if item.get('id') else {'code': item.get('code')}
        _, created = Product.objects.update_or_create(
            defaults={
                'code': item.get('code', ''),
                'name': item.get('name', ''),
                'group': group,
                'unit': item.get('unit', ''),
                'quantity': item.get('quantity', 0) or 0,
                'price': item.get('price', 0) or 0,
                'status': item.get('status', Product.STATUS_ACTIVE),
            },
            **lookup,
        )
        product_created += 1 if created else 0

    return product_created


def _resolve_raw_material(item):
    raw_material_id = item.get('raw_material_id')
    raw_material_code = str(item.get('raw_material_code', '')).strip()
    raw_material_name = str(item.get('raw_material_name', '')).strip()

    if raw_material_id:
        existing = RawMaterial.objects.filter(id=raw_material_id).first()
        if existing:
            return existing
    if raw_material_code:
        existing = RawMaterial.objects.filter(code__iexact=raw_material_code).first()
        if existing:
            return existing
    if raw_material_name:
        existing = RawMaterial.objects.filter(name__iexact=raw_material_name).first()
        if existing:
            return existing
    return None


def _seed_semi_finished_products():
    items = _read_json(Path('ban-thanh-pham') / 'semi-finished-products.json', 'semi_finished_products')
    product_created = 0
    bom_created = 0

    for item in items:
        lookup = {'id': item.get('id')} if item.get('id') else {'code': item.get('code')}
        product, created = SemiFinishedProduct.objects.update_or_create(
            defaults={
                'code': item.get('code', ''),
                'name': item.get('name', ''),
                'group': item.get('group', ''),
                'unit': item.get('unit', ''),
                'quantity': item.get('quantity', 0) or 0,
                'price': item.get('price', 0) or 0,
                'cost_price': item.get('cost_price', 0) or 0,
                'compare_price': item.get('compare_price', 0) or 0,
                'description': item.get('description', ''),
                'production_notes': item.get('production_notes', ''),
                'notes': item.get('notes', ''),
                'status': item.get('status', SemiFinishedProduct.STATUS_ACTIVE),
            },
            **lookup,
        )
        product_created += 1 if created else 0

        product.bom_items.all().delete()
        for bom_item in item.get('bom_items', []):
            raw_material = _resolve_raw_material(bom_item)
            if not raw_material:
                continue
            SemiFinishedProductBOM.objects.create(
                semi_finished_product=product,
                raw_material=raw_material,
                quantity=bom_item.get('quantity', 0) or 0,
                unit=bom_item.get('unit', '') or raw_material.unit,
            )
            bom_created += 1

    return product_created, bom_created


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def production_defaults_bootstrap(request):
    with transaction.atomic():
        state, _ = BootstrapState.objects.select_for_update().get_or_create(
            key=PRODUCTION_DEFAULTS_KEY,
        )

        if state.is_completed:
            return Response({
                'seeded': False,
                'already_seeded': True,
                'message': 'Dữ liệu mặc định sản xuất đã được khởi tạo trước đó.',
            })

        has_existing_data = any([
            MaterialGroup.objects.exists(),
            Material.objects.exists(),
            RawMaterial.objects.exists(),
            ProductGroup.objects.exists(),
            Product.objects.exists(),
            SemiFinishedProduct.objects.exists(),
        ])

        if has_existing_data:
            state.is_completed = True
            state.completed_at = timezone.now()
            state.notes = 'skipped-existing-data'
            state.save(update_fields=['is_completed', 'completed_at', 'notes', 'updated_at'])
            return Response({
                'seeded': False,
                'already_seeded': False,
                'skipped_existing_data': True,
                'message': 'Hệ thống đã có dữ liệu sản xuất, bỏ qua seed mặc định.',
            })

        created_product_groups = _seed_product_groups()
        created_material_groups = _seed_material_groups()
        created_materials, created_raw_materials = _seed_materials_and_raw_materials()
        created_products = _seed_products()
        created_semi_finished_products, created_semi_finished_bom = _seed_semi_finished_products()

        state.is_completed = True
        state.completed_at = timezone.now()
        state.notes = 'seeded-from-data-sync'
        state.save(update_fields=['is_completed', 'completed_at', 'notes', 'updated_at'])

        return Response({
            'seeded': True,
            'already_seeded': False,
            'message': 'Đã khởi tạo dữ liệu mặc định cho sản xuất.',
            'counts': {
                'product_groups': created_product_groups,
                'material_groups': created_material_groups,
                'materials': created_materials,
                'raw_materials': created_raw_materials,
                'products': created_products,
                'semi_finished_products': created_semi_finished_products,
                'semi_finished_bom_items': created_semi_finished_bom,
            },
        })
