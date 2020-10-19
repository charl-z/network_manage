from django.db import models
from datetime import datetime
# Create your models here.


class QueryDevice(models.Model):
    """设备探测任务"""
    QUERY_STATUS = (
        (0, u'未启动'),
        (1, u'等待中'),
        (2, u'探测完成'),
        (3, u'路由不可达'),
        (4, u'未知错误'),
        (5, u'端口未开放'),
        (6, u'探测中...')
    )
    snmp_host = models.GenericIPAddressField(verbose_name=u'探测设备IP', max_length=30, unique=True)
    snmp_host_int = models.BigIntegerField(verbose_name=u'探测设备IP十进制', blank=False, default=0)
    snmp_port = models.IntegerField(verbose_name=u'探测设备端口', default=0)
    device_hostname = models.TextField(verbose_name=u'探测设备主机名', default='')
    device_manufacturer_info = models.TextField(verbose_name=u'探测设备厂商信息', default='')
    snmp_group = models.CharField(verbose_name=u'团体名', max_length=30)
    query_status = models.SmallIntegerField(verbose_name='探测状态', choices=QUERY_STATUS, default=0)
    auto_enable = models.BooleanField(verbose_name=u'定时任务开关', default=False)
    crontab_time = models.TextField(verbose_name=u'定时任务时间', default='')
    networks = models.TextField(verbose_name=u'所有网络', default='[]')
    created_time = models.DateTimeField(verbose_name=u'创建时间', default=datetime.now())
    last_mod_time = models.DateTimeField(verbose_name=u'修改时间', default=datetime.now())

    def __str__(self):
        return self.snmp_host

    class Meta:
        db_table = "device_query_task"
        verbose_name = u"设备探测信息"
        verbose_name_plural = verbose_name


class SnmpQueryResult(models.Model):
    """设备探测结果详情"""
    snmp_host = models.GenericIPAddressField(verbose_name=u'探测设备IP', max_length=30, blank=False)
    snmp_host_int = models.BigIntegerField(verbose_name=u'探测设备IP十进制', blank=False, default=0)
    if_name = models.TextField(verbose_name=u'端口名称', default='')
    if_speed = models.CharField(verbose_name=u'端口速率', max_length=100, default='')
    if_operstatus = models.CharField(verbose_name=u'端口状态', max_length=100, default='')
    if_ip_setup = models.TextField(verbose_name=u'端口ip地址', default='')
    if_descrs = models.TextField(verbose_name=u'端口描述信息', default='')
    arp_infos = models.TextField(verbose_name=u'arp信息', default='')
    brige_macs = models.TextField(verbose_name=u'二层mac信息', default='')
    if_index =  models.IntegerField(verbose_name=u'端口索引', default=0, )
    created_time = models.DateTimeField(verbose_name=u'创建时间', default=datetime.now())
    last_mod_time = models.DateTimeField(verbose_name=u'修改时间', default=datetime.now())

    def __str__(self):
        return self.if_name

    class Meta:
        db_table = "device_query_result"
        unique_together = ("snmp_host_int", "if_index")
        verbose_name = u"设备探测详情"
        verbose_name_plural = verbose_name


class NetworkToDevice(models.Model):
    """探测网络所在的设备"""
    network = models.GenericIPAddressField(verbose_name=u'网络', max_length=30, blank=False)
    device_ip = models.TextField(verbose_name=u'探测设备IP', default='[]')
    device_hostname = models.TextField(verbose_name=u'探测设备主机名', default='[]')
    interface = models.TextField(verbose_name=u'端口名称', default='[]')

    def __str__(self):
        return self.network

    class Meta:
        db_table = "network_to_device"
        verbose_name = u"探测网络对应的设备"
        verbose_name_plural = verbose_name


class DeviceArpTable(models.Model):
    ip = models.GenericIPAddressField(verbose_name=u'IP地址', max_length=30, blank=False, unique=True)
    network = models.GenericIPAddressField(verbose_name=u'网络', max_length=30, blank=False)
    mac = models.CharField(verbose_name=u'mac地址', max_length=20, default='')
    host_and_port = models.TextField(verbose_name=u'IP地址所对应的主机名和端口', default='')
    query_time = models.DateTimeField(verbose_name=u'最新探测时间', default=datetime.now())

    def __str__(self):
        return self.ip

    class Meta:
        db_table = "device_query_arp_table"
        verbose_name = u"设备探测arp表"
        verbose_name_plural = verbose_name


class DeviceMacTable(models.Model):
    mac = models.CharField(verbose_name=u'mac地址', max_length=20, unique=True, default='')
    # ip = models.TextField(verbose_name=u'IP地址', default='[]')  # 一个mac可能对应多个IP地址
    host_and_port = models.TextField(verbose_name=u'mac地址所对应的主机名和端口', default='')
    query_time = models.DateTimeField(verbose_name=u'最新探测时间', default=datetime.now())

    def __str__(self):
        return self.mac

    class Meta:
        db_table = "device_query_mac_table"
        verbose_name = u"设备探测MAC表"
        verbose_name_plural = verbose_name


class SnmpQueryIpRouteTable(models.Model):
    """设备探测的路由表"""
    IP_ROUTE_TABLE_TYPE = (
        (1, 'other'),
        (2, 'invalid'),
        (3, 'direct'),
        (4, 'indirect'),
    )
    snmp_host = models.GenericIPAddressField(verbose_name=u'探测设备IP', max_length=30, blank=False)
    snmp_host_int = models.BigIntegerField(verbose_name=u'探测设备IP十进制', blank=False, default=0)
    dest_ip = models.CharField(verbose_name=u'目的ip地址/掩码', max_length=30, default='')
    next_hop = models.CharField(verbose_name=u'下一跳IP', max_length=30, default='')
    port_index = models.IntegerField(verbose_name=u'端口索引', default=0)
    route_table_type = models.IntegerField(verbose_name='路由表类型', choices=IP_ROUTE_TABLE_TYPE, default=0)
    created_time = models.DateTimeField(verbose_name=u'创建时间', default=datetime.now())
    last_mod_time = models.DateTimeField(verbose_name=u'修改时间', default=datetime.now())

    class Meta:
        db_table = "ip_route_table"
        unique_together = ("snmp_host_int", "dest_ip")
        verbose_name = u"设备探测的路由表"
        verbose_name_plural = verbose_name