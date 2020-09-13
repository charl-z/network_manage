# -*- coding: utf-8 -*-
# @Time    : 2020/8/20 12:33
# @Author  : charl-z

from django.conf.urls import url
from .views import *

urlpatterns = [
    url(r'^get_network_group_info/', get_network_group_info),
    url(r'^get_all_group_name/', get_all_group_name),
    url(r'^new_build_group/', new_build_group),
    url(r'^get_group_to_parent/', get_group_to_parent),
    url(r'^delete_group/', delete_group),
]



