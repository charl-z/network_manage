#!/bin/bash
source /etc/profile

/usr/bin/python /opt/network_manage/bin/service_monitor.py
psql -U postgres -p 5430 -c "drop database device_query;"
psql -U postgres -p 5430 -c "create database device_query;"

cd /opt/network_manage/
rm -rf /opt/network_manage/apps/network_query/migrations/00*
rm -rf /opt/network_manage/apps/device_query/migrations/00*


/root/.virtualenvs/auto_test/bin/python manage.py makemigrations
/root/.virtualenvs/auto_test/bin/python manage.py migrate
/root/.virtualenvs/auto_test/bin/python /opt/network_manage/libs/insert_mac_db.py 


