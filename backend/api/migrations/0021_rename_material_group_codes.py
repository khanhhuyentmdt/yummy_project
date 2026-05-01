from django.db import migrations


def rename_material_group_codes(apps, schema_editor):
    MaterialGroup = apps.get_model('api', 'MaterialGroup')

    used_codes = set(
        MaterialGroup.objects.exclude(code__startswith='NNVL').values_list('code', flat=True)
    )

    for group in MaterialGroup.objects.filter(code__startswith='NNVL').order_by('id'):
        suffix = ''.join(ch for ch in (group.code or '') if ch.isdigit())
        next_number = int(suffix) if suffix else group.id
        next_code = f'MNH{next_number:03d}'

        while next_code in used_codes:
            next_number += 1
            next_code = f'MNH{next_number:03d}'

        group.code = next_code
        group.save(update_fields=['code'])
        used_codes.add(next_code)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_add_material_group'),
    ]

    operations = [
        migrations.RunPython(rename_material_group_codes, noop_reverse),
    ]
