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
