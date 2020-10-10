from django.db import models

# Create your models here.

from django.db import models
from datetime import datetime
# Create your models here.


class NetworkQueryList(models.Model):
    """网络探测任务"""
    QUERY_STATUS = (
        (0, u'未启动'),
        (1, u'等待中'),
        (2, u'探测完成'),
        (3, u'未知错误'),
        (4, u'探测中...')
    )
    network = models.GenericIPAddressField(verbose_name=u'探测网络', max_length=30, unique=True)
    tcp_query_ports = models.TextField(verbose_name=u'TCP探测端口', default='')
    udp_query_ports = models.TextField(verbose_name=u'UDP探测端口', default='')
    online_ip_num = models.IntegerField(verbose_name=u'在线地址数量', default=0)
    query_status = models.SmallIntegerField(verbose_name='探测状态', choices=QUERY_STATUS, default=0)
    auto_enable = models.BooleanField(verbose_name=u'定时任务开关', default=False)
    crontab_task = models.TextField(verbose_name=u'定时任务时间', default='')
    query_time = models.DateTimeField(verbose_name=u'最新探测时间', default=datetime.now())
    created_time = models.DateTimeField(verbose_name=u'创建时间', default=datetime.now())

    def __str__(self):
        return self.network

    class Meta:
        db_table = "network_query_task"
        verbose_name = u"网络探测信息"
        verbose_name_plural = verbose_name


class NetworkQueryDetails(models.Model):
    network = models.GenericIPAddressField(verbose_name=u'探测网络', max_length=30, db_index=True)
    ip = models.GenericIPAddressField(verbose_name=u'ip地址', max_length=30, unique=True, db_index=True)
    scan_mac = models.CharField(verbose_name=u'MAC地址', max_length=30)
    scan_mac_product = models.CharField(verbose_name=u'MAC地址', max_length=60)
    tcp_port_list = models.TextField(verbose_name=u'TCP端口探测数据', default='')
    udp_port_list = models.TextField(verbose_name=u'UDP端口探测数据', default='')
    hostname = models.CharField(verbose_name=u'MAC地址', max_length=60, default='')
    query_time = models.DateTimeField(verbose_name=u'最新探测时间', default=datetime.now())

    def __str__(self):
        return self.ip

    class Meta:
        db_table = "network_query_result"
        verbose_name = u"网络探测IP信息"
        verbose_name_plural = verbose_name