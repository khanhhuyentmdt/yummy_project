from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_location_history'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='name',
            field=models.CharField(max_length=200, unique=True, verbose_name='Ten dia diem'),
        ),
    ]
