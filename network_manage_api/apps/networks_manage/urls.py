# -*- coding: utf-8 -*-
# @Time    : 2020/8/20 12:33
# @Author  : charl-z

from django.conf.urls import url
from .views import *

urlpatterns = [
    url(r'^build_network/', build_network),
    url(r'^get_all_networks/', get_all_networks),

]



