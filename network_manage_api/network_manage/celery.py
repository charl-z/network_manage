# -*- coding: utf-8 -*-
# @Time    : 2020/3/16 19:35
# @Author  : charl-z

from celery import Celery
from django.conf import settings
import os

# 为celery设置环境变量
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'network_manage.settings')

# 创建应用
app = Celery('testcelery')

# 酸配置应用
app.conf.update(

	# 本地Redis服务器
	BROKER_URL='redis://127.0.0.1:6379/2',
)

app.autodiscover_tasks(settings.INSTALLED_APPS)