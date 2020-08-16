"""network_manage URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.urls import path, include
from django.contrib import admin
from device_query.views import add_device_query,\
                                add_device_query_to_cache,\
                                exec_device_query_task, \
                                get_device_query_info, \
                                del_device_query,\
                                get_device_details, check_user_password, get_console_info, get_device_port_macs,get_device_port_arp, get_device_query_crontab_task


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'api/add_device_query/$', add_device_query),
    url(r'api/add_device_query_to_cache/$', add_device_query_to_cache),
    url(r'api/exec_device_query_task/$', exec_device_query_task),
    url(r'api/get_device_query_info/$', get_device_query_info),
    url(r'api/del_device_query/$', del_device_query),
    url(r'api/check_user_password/$', check_user_password),
    url(r'api/get_device_details/(.+)/$', get_device_details),
    url(r'api/device_port_macs/(.+)/$', get_device_port_macs),
    url(r'api/device_port_arp/(.+)/$', get_device_port_arp),
    url(r'api/host/', get_console_info),
    url(r'api/device_query_crontab_task/(.+)/$', get_device_query_crontab_task),

    path('setting/', include('apps.setting.urls')),

]
