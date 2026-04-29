from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_location_extended_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='created_by_name',
            field=models.CharField(blank=True, max_length=200, verbose_name='Nguoi tao'),
        ),
    ]
