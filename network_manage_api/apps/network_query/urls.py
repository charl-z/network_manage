# -*- coding: utf-8 -*-
# @Time    : 2020/8/20 12:33
# @Author  : weidengyi

from django.conf.urls import url
from .views import add_network_query, get_network_query_info, del_network_query

urlpatterns = [
    url(r'^add_network_query/', add_network_query),
    url(r'^get_network_query_info/', get_network_query_info),
    url(r'^del_network_query/', del_network_query),

]



