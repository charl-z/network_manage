# -*- coding: utf-8 -*-
# @Time    : 2020/8/20 12:33
# @Author  : weidengyi

from django.conf.urls import url
from .views import *

urlpatterns = [
    url(r'^add_network_query/', add_network_query),
    url(r'^get_network_query_info/', get_network_query_info),
    url(r'^del_network_query/', del_network_query),
    url(r'^add_network_query_to_cache/', add_network_query_to_cache),
    url(r'^exec_network_query_task/', exec_network_query_task),
    url(r'^get_network_details/', get_network_details),
    url(r'^get_tcp_ports_details/(.+)/$', get_tcp_ports_details),
    url(r'^get_udp_ports_details/(.+)/$', get_udp_ports_details),

]



