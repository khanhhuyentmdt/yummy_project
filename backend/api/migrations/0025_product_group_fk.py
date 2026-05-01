from django.db import migrations, models
import django.db.models.deletion


def forwards(apps, schema_editor):
    Product = apps.get_model('api', 'Product')
    ProductGroup = apps.get_model('api', 'ProductGroup')

    def next_group_code():
        groups = ProductGroup.objects.filter(code__regex=r'^NSP\d+$').order_by('-code')
        if not groups.exists():
            return 'NSP001'
        highest_code = groups.first().code
        try:
            number = int(highest_code[3:])
            return f'NSP{number + 1:03d}'
        except (ValueError, IndexError):
            return 'NSP001'

    for product in Product.objects.all():
        legacy_name = (product.group or '').strip()
        if not legacy_name:
            continue
        group = ProductGroup.objects.filter(name__iexact=legacy_name).first()
        if not group:
            group = ProductGroup.objects.create(
                code=next_group_code(),
                name=legacy_name,
                status='active',
            )
        product.group_ref_id = group.id
        product.save(update_fields=['group_ref'])


def backwards(apps, schema_editor):
    Product = apps.get_model('api', 'Product')
    for product in Product.objects.select_related('group_ref').all():
        product.group = product.group_ref.name if product.group_ref_id else ''
        product.save(update_fields=['group'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_expand_supplier_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='group_ref',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='products',
                to='api.productgroup',
                verbose_name='Nhóm SP',
            ),
        ),
        migrations.RunPython(forwards, backwards),
        migrations.RemoveField(
            model_name='product',
            name='group',
        ),
        migrations.RenameField(
            model_name='product',
            old_name='group_ref',
            new_name='group',
        ),
    ]
