#!/bin/bash
source /etc/profile

base_path='/opt/network_manage/network_manage_api'
python_path='/root/.virtualenvs/network_manage/bin'
python_packages_path='/root/.virtualenvs/network_manage/lib/python3.6/site-packages/network_manage.pth'

# 检查python安装包路径下是否存在python的自定义模块搜索配置
if [ ! -s $python_packages_path ]; then
	echo $base_path >> $python_packages_path	
fi

# 检查数据库文件是否是存在
db_path='/usr/local/network_manage'
if [ ! -e $db_path ]; then
	mkdir $db_path
	chown postgres:postgres $db_path
	su - postgres -c "initdb -D $db_path"    
	rm -rf $db_path/postgres.conf
	cp $base_path/conf/postgresql.conf $db_path
	su - postgres -c "/usr/local/pgsql/bin/pg_ctl -D /usr/local/network_manage/ -l /home/postgres/pg_lease.log start"
	sleep 60
#	psql -U postgres -p 5430 -c "create database device_query;"
fi

rm -rf $base_path/apps/network_query/migrations/00*
rm -rf $base_path/apps/device_query/migrations/00*

cd $base_path
psql -U postgres -p 5430 -c "drop database device_query;"
psql -U postgres -p 5430 -c "create database device_query;"
$python_path/python manage.py makemigrations
$python_path/python manage.py migrate
$python_path/python $base_path/libs/insert_mac_db.py

cat /var/spool/cron/root | grep "service_monitor.sh"
if [ $? -ne 0 ];then
	# Todo
	# 不清楚为什么执行$python_path/python $base_path/bin/service_monitor.py，后台实际上没有执行
     echo "*/1 * * * * $base_path/bin/service_monitor.sh >>/dev/null 2>&1" >>  /var/spool/cron/root
fi
