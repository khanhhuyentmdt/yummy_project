import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_location_created_by_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='LocationHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('actor_name', models.CharField(blank=True, max_length=200, verbose_name='Nguoi thuc hien')),
                ('action', models.CharField(max_length=300, verbose_name='Hanh dong')),
                ('location', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='history',
                    to='api.location',
                    verbose_name='Dia diem',
                )),
            ],
            options={
                'verbose_name': 'LocationHistory',
                'ordering': ['-timestamp'],
            },
        ),
    ]
