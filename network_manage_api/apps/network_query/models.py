from django.db import models

# Create your models here.

from django.db import models
from datetime import datetime
# Create your models here.


class NetworkDevice(models.Model):
    """网络探测任务"""
    QUERY_STATUS = (
        (0, u'未启动'),
        (1, u'等待中'),
        (2, u'探测完成'),
        (3, u'未知错误'),
        (4, u'探测中...')
    )
    network = models.GenericIPAddressField(verbose_name=u'探测网络', max_length=30, unique=True)
    query_ports = models.TextField(verbose_name=u'探测端口', default='')
    online_ip_num = models.IntegerField(verbose_name=u'在线地址数量', default=0)
    auto_enable = models.BooleanField(verbose_name=u'定时任务开关', default=False)
    query_status = models.SmallIntegerField(verbose_name='探测状态', choices=QUERY_STATUS, default=0)
    crontab_task = models.TextField(verbose_name=u'定时任务时间', default='')
    query_time = models.DateTimeField(verbose_name=u'最新探测时间', default=datetime.now())
    created_time = models.DateTimeField(verbose_name=u'创建时间', default=datetime.now())


    def __str__(self):
        return self.network

    class Meta:
        verbose_name = u"网络探测信息"
        verbose_name_plural = verbose_name
