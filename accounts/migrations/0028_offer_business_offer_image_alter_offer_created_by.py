# Generated by Django 5.1.5 on 2025-06-04 15:05

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0027_alter_offerredemption_code'),
    ]

    operations = [
        migrations.AddField(
            model_name='offer',
            name='business',
            field=models.ForeignKey(blank=True, limit_choices_to={'is_business': True}, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='offer',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='offer_images/'),
        ),
        migrations.AlterField(
            model_name='offer',
            name='created_by',
            field=models.ForeignKey(limit_choices_to={'is_admin': True}, on_delete=django.db.models.deletion.CASCADE, related_name='offers_created', to=settings.AUTH_USER_MODEL),
        ),
    ]
