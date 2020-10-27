# -*- coding: utf-8 -*-
# @Time    : 2020/8/20 12:33
# @Author  : charl-z

from django.conf.urls import url
from .views import *

urlpatterns = [
    url(r'^build_network/', build_network),
    url(r'^get_all_networks/', get_all_networks),
    url(r'^patch_import_networks/', patch_import_networks),
    url(r'^patch_export_networks/', patch_export_networks),
    url(r'^get_network_ip_details/', get_network_ip_details),
    url(r'^edit_ip_details/', EidtIpDetails.as_view()),
    url(r'^resolve_ip_conflict/', resolve_ip_conflict),


]



