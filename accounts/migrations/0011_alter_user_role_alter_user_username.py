# Generated by Django 5.2 on 2025-04-22 09:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_user_is_admin_user_is_approved_user_is_banned_until'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(blank=True, choices=[('visitor', 'Visitor'), ('business', 'Business'), ('admin', 'Admin')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(max_length=150),
        ),
    ]
