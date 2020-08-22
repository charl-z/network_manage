# Generated by Django 2.0.6 on 2020-08-20 14:17

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('device_query', '0002_auto_20200818_1226'),
    ]

    operations = [
        migrations.AlterField(
            model_name='querydevice',
            name='created_time',
            field=models.DateTimeField(default=datetime.datetime(2020, 8, 20, 22, 17, 23, 457475), verbose_name='创建时间'),
        ),
        migrations.AlterField(
            model_name='querydevice',
            name='last_mod_time',
            field=models.DateTimeField(default=datetime.datetime(2020, 8, 20, 22, 17, 23, 457588), verbose_name='修改时间'),
        ),
        migrations.AlterField(
            model_name='snmpqueryiproutetable',
            name='created_time',
            field=models.DateTimeField(default=datetime.datetime(2020, 8, 20, 22, 17, 23, 462448), verbose_name='创建时间'),
        ),
        migrations.AlterField(
            model_name='snmpqueryiproutetable',
            name='last_mod_time',
            field=models.DateTimeField(default=datetime.datetime(2020, 8, 20, 22, 17, 23, 462549), verbose_name='修改时间'),
        ),
        migrations.AlterField(
            model_name='snmpqueryresult',
            name='created_time',
            field=models.DateTimeField(default=datetime.datetime(2020, 8, 20, 22, 17, 23, 460229), verbose_name='创建时间'),
        ),
        migrations.AlterField(
            model_name='snmpqueryresult',
            name='last_mod_time',
            field=models.DateTimeField(default=datetime.datetime(2020, 8, 20, 22, 17, 23, 460338), verbose_name='修改时间'),
        ),
    ]
