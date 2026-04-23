from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_add_user_role_material'),
    ]

    operations = [
        migrations.AddField(
            model_name='material',
            name='notes',
            field=models.TextField(blank=True, verbose_name='Ghi chu'),
        ),
        migrations.AddField(
            model_name='material',
            name='batch_management',
            field=models.BooleanField(default=False, verbose_name='Quan ly theo lo HSD'),
        ),
    ]
