from django.db import migrations, models
import django.db.models.deletion


def forwards(apps, schema_editor):
    ProductBOM = apps.get_model('api', 'ProductBOM')
    RawMaterial = apps.get_model('api', 'RawMaterial')
    Material = apps.get_model('api', 'Material')
    MaterialGroup = apps.get_model('api', 'MaterialGroup')

    def next_code(model, prefix, width=3):
        items = model.objects.filter(code__regex=rf'^{prefix}\d+$').order_by('-code')
        if not items.exists():
            return f'{prefix}001'
        highest_code = items.first().code
        try:
            number = int(highest_code[len(prefix):])
            return f'{prefix}{number + 1:0{width}d}'
        except (ValueError, IndexError):
            return f'{prefix}001'

    def get_default_group():
        group = MaterialGroup.objects.filter(name__iexact='Nhóm BOM mặc định').first()
        if group:
            return group
        existing = MaterialGroup.objects.order_by('id').first()
        if existing:
            return existing
        return MaterialGroup.objects.create(
            code=next_code(MaterialGroup, 'MNH'),
            name='Nhóm BOM mặc định',
            description='Tự tạo khi chuyển dữ liệu BOM sản phẩm sang nguyên vật liệu.',
            status='active',
        )

    default_group = get_default_group()

    for bom in ProductBOM.objects.select_related('raw_material').all():
        legacy = getattr(bom, 'raw_material', None)
        if not legacy:
            continue

        material = Material.objects.filter(code__iexact=legacy.code).first()
        if not material:
            material = Material.objects.filter(name__iexact=legacy.name).first()
        if not material:
            material_code = legacy.code or next_code(Material, 'NVL')
            if Material.objects.filter(code__iexact=material_code).exists():
                material_code = next_code(Material, 'NVL')
            material = Material.objects.create(
                code=material_code,
                name=legacy.name,
                group=default_group.name,
                unit=legacy.unit,
                status='active',
            )

        bom.material_ref_id = material.id
        bom.save(update_fields=['material_ref'])


def backwards(apps, schema_editor):
    ProductBOM = apps.get_model('api', 'ProductBOM')
    RawMaterial = apps.get_model('api', 'RawMaterial')

    def next_code():
        items = RawMaterial.objects.filter(code__regex=r'^NL\d+$').order_by('-code')
        if not items.exists():
            return 'NL001'
        highest_code = items.first().code
        try:
            number = int(highest_code[2:])
            return f'NL{number + 1:03d}'
        except (ValueError, IndexError):
            return 'NL001'

    for bom in ProductBOM.objects.select_related('material_ref').all():
        material = getattr(bom, 'material_ref', None)
        if not material:
            continue

        raw_material = RawMaterial.objects.filter(code__iexact=material.code).first()
        if not raw_material:
            raw_material = RawMaterial.objects.filter(name__iexact=material.name).first()
        if not raw_material:
            raw_code = material.code or next_code()
            if RawMaterial.objects.filter(code__iexact=raw_code).exists():
                raw_code = next_code()
            raw_material = RawMaterial.objects.create(
                code=raw_code,
                name=material.name,
                unit=material.unit,
            )

        bom.raw_material_id = raw_material.id
        bom.save(update_fields=['raw_material'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0025_product_group_fk'),
    ]

    operations = [
        migrations.AddField(
            model_name='productbom',
            name='material_ref',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='product_bom_items',
                to='api.material',
                verbose_name='Nguyên vật liệu',
            ),
        ),
        migrations.AlterUniqueTogether(
            name='productbom',
            unique_together={('product', 'material_ref')},
        ),
        migrations.RunPython(forwards, backwards),
        migrations.RemoveField(
            model_name='productbom',
            name='raw_material',
        ),
        migrations.RenameField(
            model_name='productbom',
            old_name='material_ref',
            new_name='raw_material',
        ),
        migrations.AlterUniqueTogether(
            name='productbom',
            unique_together={('product', 'raw_material')},
        ),
    ]
