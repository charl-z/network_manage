# -*- coding: utf-8 -*-
# @Time    : 2020/8/22 10:49
# @Author  : weidengyi

from django.conf.urls import url
from .views import *

urlpatterns = [
	url(r'^add_device_query/', add_device_query),
	url(r'^add_device_query_to_cache/', add_device_query_to_cache),
	url(r'^exec_device_query_task/', exec_device_query_task),
	url(r'^get_device_query_info/', get_device_query_info),
	url(r'^del_device_query/', del_device_query),
	url(r'^check_user_password/$', check_user_password),
	url(r'^get_device_details/(.+)/$', get_device_details),
	url(r'^device_port_macs/(.+)/$', get_device_port_macs),
	url(r'^device_port_arp/(.+)/$', get_device_port_arp),
	url(r'^host/', get_console_info),
	url(r'^device_query_crontab_task/(.+)/$', get_device_query_crontab_task),
]


