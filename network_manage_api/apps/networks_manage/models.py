from django.db import models
from datetime import datetime
# Create your models here.


class Networks(models.Model):
    """所有的网络"""
    network = models.GenericIPAddressField(verbose_name=u'网络', max_length=30, unique=True)
    ip_used = models.IntegerField(verbose_name=u'被使用IP地址数量', default=0)
    ip_total = models.IntegerField(verbose_name=u'总的IP地址数量', default=0)
    query_time = models.DateTimeField(verbose_name=u'最新探测时间', default=datetime.now())
    created_time = models.DateTimeField(verbose_name=u'创建时间', default=datetime.now())

    def __str__(self):
        return self.network

    class Meta:
        db_table = "networks"
        verbose_name = u"网络信息"
        verbose_name_plural = verbose_name


class IpDetailsInfo(models.Model):
    """ip地址详细信息"""
    IP_STATUS = (
        (0, u'离线'),
        (1, u'在线'),
    )
    IP_TYPE = (
        (0, u'未管理'),
        (1, u'手动地址'),
        (2, u'冲突地址'),

    )
    ip = models.GenericIPAddressField(verbose_name=u'网络', max_length=30, unique=True)
    network = models.GenericIPAddressField(verbose_name=u'网络', max_length=30)
    query_mac = models.CharField(verbose_name=u'mac地址', max_length=20, default='')  # 设备探测或网络探测的mac地址
    device_hostname_interface = models.TextField(verbose_name=u'IP地址所对应的主机名和端口', default='')
    manual_mac = models.CharField(verbose_name=u'手动配置mac地址', max_length=20, default='')
    tcp_port_list = models.TextField(verbose_name=u'TCP端口探测数据', default='')
    udp_port_list = models.TextField(verbose_name=u'UDP端口探测数据', default='')
    hostname = models.CharField(verbose_name=u'MAC地址', max_length=60, default='')
    ip_status = models.SmallIntegerField(verbose_name=u'IP地址状态', choices=IP_STATUS, default=0)
    ip_type = models.SmallIntegerField(verbose_name=u'IP地址类型', choices=IP_TYPE, default=0)
    source_device_query = models.BooleanField(verbose_name=u'来自设备探测', default=False)
    source_network_query = models.BooleanField(verbose_name=u'来自网络探测', default=False)
    query_time = models.DateTimeField(verbose_name=u'最新探测时间', default=datetime.now())
    created_time = models.DateTimeField(verbose_name=u'创建时间', default=datetime.now())

    def __str__(self):
        return self.ip

    class Meta:
        db_table = "ip_detail_info"
        verbose_name = u"网络信息"
        verbose_name_plural = verbose_name
