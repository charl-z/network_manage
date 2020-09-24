# -*- coding: utf-8 -*-
from django.http import HttpResponse
from libs.utils import add_crontab_task_to_redis
from django.core.paginator import Paginator
import datetime

from libs.ssh import SSH
from libs.IPy import IP
from libs.utils import analysis_cron_time
from libs.tool import check_ip, ipv4_to_num
from libs import device_query_fun
from libs.utils import get_conf_handle
conf_data = get_conf_handle()

import json
import nmap
import paramiko
import logging
import redis
import socket
from device_query.models import SnmpQueryResult, QueryDevice, SnmpQueryIpRouteTable, NetworkToDivice
logger = logging.getLogger('django')


r = redis.Redis(host=conf_data['REDIS_CONF']['host'],
                port=conf_data['REDIS_CONF']['port'],
                password=conf_data['REDIS_CONF']['password'],
                decode_responses=True,
                db=conf_data['REDIS_CONF']['db']
                )


def get_device_query_info(request):
    """获取所有探测设备的信息"""
    page_size = request.GET.get("page_size")
    current_page = request.GET.get("current_page")
    search_ip = request.GET.get("search_ip")

    if search_ip:
        all_device = QueryDevice.objects.filter(snmp_host__contains=search_ip)
    else:
        all_device = QueryDevice.objects.all()
    data = dict()
    result = []
    paginator = Paginator(all_device, page_size)
    total_device = all_device.count()
    device_page = paginator.page(current_page)
    for device in device_page:
        tmp_data = dict()
        tmp_data['key'] = device.id
        tmp_data["ip_address"] = device.snmp_host
        tmp_data["device_name"] = device.device_hostname
        tmp_data["device_company"] = device.device_manufacturer_info
        tmp_data["query_status"] = device.get_query_status_display()
        tmp_data["snmp_port"] = device.snmp_port
        tmp_data["snmp_community"] = device.snmp_group
        tmp_data["auto_enable"] = device.auto_enable
        tmp_data["crontab_task"] = device.crontab_time
        tmp_data["query_time"] = (device.last_mod_time + datetime.timedelta(hours=8)).strftime(
            "%Y-%m-%d %H:%M:%S")
        result.append(tmp_data)
    data['data'] = result
    data['total_device'] = total_device
    data["status"] = "success"
    return HttpResponse(json.dumps(data), content_type="application/json")


def check_user_password(request):
    """
    判断远程登陆用户名和密码是否准确
    """
    if request.method == "POST":
        try:
            data = dict()
            post_data = json.loads(str(request.body, encoding='utf-8'))
            info = {
                "hostname": post_data["hostname"],
                "username": post_data["username"],
                "password": post_data["password"],
                "port": post_data["port"]
            }
            ssh = SSH(**info)
            ssh.get_client()

            data["status"] = "success"
            data['result'] = info
        except paramiko.ssh_exception.NoValidConnectionsError:
            data["status"] = "fail"
            data["result"] = u"端口未开放或路由不可达，请重试或关闭！"
        except paramiko.ssh_exception.AuthenticationException:
            data["status"] = "fail"
            data["result"] = u"用户名或密码不准确，请重试或关闭！"
        except socket.error as err:
            data["status"] = "fail"
            data["result"] = u"连接超时，请重试或关闭！"
        return HttpResponse(json.dumps(data), content_type="application/json")


def get_console_info(request):
    ip = request.GET.get("ip")
    console_info = QueryDevice.objects.get(snmp_host=ip)

    result = dict()
    result["hostname"] = console_info.snmp_host
    result["username"] = console_info.ssh_console_username
    result["port"] = console_info.ssh_console_port

    data = dict()
    data["status"] = "success"
    return HttpResponse(json.dumps(data), content_type="application/json")


def del_device_query(request):
    """
    批量删除设备探测任务
    """
    if request.method == "POST":
        post_data = json.loads(str(request.body, encoding='utf-8'))
        data = dict()
        delete_ids = post_data["ids"]
        if(isinstance(delete_ids, int)):
            delete_ids = [delete_ids]

        for id in delete_ids:
            device_info = QueryDevice.objects.get(id=id)
            device_ip = device_info.snmp_host
            device_snmp_port = device_info.snmp_port
            device_snmp_group = device_info.snmp_group

            # 删除snmpqueryresult表中探测数据数据
            SnmpQueryResult.objects.filter(snmp_host_int=ipv4_to_num(device_ip)).delete()
            # 批量删除探测任务时候，redis缓存以及该设备相关的探测记录也要对应的删除
            device_infos = "{0} {1} {2}".format(device_ip, device_snmp_port, device_snmp_group)
            r.lrem(conf_data['DEVICE_QUERY_QUEUE'], device_infos, 0)
            # Todo 删除设备探测任务时候，需要将redis哈希表中的定时任务同步删除
            r.hdel(conf_data['DEVICE_QUETY_CRONTAB_HASH'], device_infos)

            QueryDevice.objects.filter(id=id).delete()
        data["status"] = "success"
        return HttpResponse(json.dumps(data), content_type="application/json")


def add_device_query(request):
    """批量添加设备探测任务，设备探测信息写入到数据库"""
    if request.method == "POST":
        data = dict()
        post_data = json.loads(str(request.body, encoding='utf-8'))
        ips = post_data["device_ips"]
        community = post_data["community"]
        port = post_data["port"]
        logger.info("ip:{0}, port:{1}, community:{2}".format(ips, port, community))
        ips = ips.split(" ")
        unvalid_ip = []
        crontab_task = ''
        auto_enable = False
        if post_data["crontab_task"] == "on":
            auto_enable = True
            crontab_task = analysis_cron_time(post_data)
        for ip in ips:
            if not check_ip(ip):
                unvalid_ip.append("{0} 无效地址".format(ip))
            elif QueryDevice.objects.filter(snmp_host=ip):
                unvalid_ip.append("{0} 地址已存在".format(ip))
        if len(unvalid_ip) == 0:
            for ip in ips:
                QueryDevice.objects.create(
                    snmp_host=ip,
                    snmp_host_int=ipv4_to_num(ip),
                    snmp_port=port,
                    snmp_group=community,
                    query_status=0,
                    auto_enable=auto_enable,
                    crontab_time=crontab_task.replace("'", '"')
                )
                if auto_enable:  # 如果定时任务开启，则要更新redis哈希表中的定时任务数据
                    crontab_task_dict = dict()
                    crontab_task_dict["{0} {1} {2}".format(ip, port, community)] = crontab_task.replace("'", '"')
                    add_crontab_task_to_redis(crontab_task_dict, conf_data["NETWORK_QUETY_CRONTAB_HASH"])
            data["status"] = "success"
        else:
            data["status"] = "success"
            data["data"] = unvalid_ip
        return HttpResponse(json.dumps(data), content_type="application/json")
    if request.method == "PUT":
        data = dict()
        post_data = json.loads(str(request.body, encoding='utf-8'))
        device_ip = post_data["device_ips"]
        community = post_data["community"]
        port = post_data["port"]
        crontab_task = ''
        auto_enable = False
        if post_data["crontab_task"] == "on":
            auto_enable = True
            crontab_task = analysis_cron_time(post_data)

        QueryDevice.objects.filter(snmp_host=device_ip).update(
                            snmp_port=port,
                            snmp_group=community,
                            query_status=0,
                            auto_enable=auto_enable,
                            crontab_time=crontab_task.replace("'", '"'),
                            )
        # todo 如果定时任务开启，则要更新redis哈希表中的定时任务数据
        if auto_enable:
            crontab_task_dict = dict()
            crontab_task_dict["{0} {1} {2}".format(device_ip, port, community)] = crontab_task.replace("'", '"')
            add_crontab_task_to_redis(crontab_task_dict, conf_data["DEVICE_QUETY_CRONTAB_HASH"])
        data["status"] = "success"

        return HttpResponse(json.dumps(data), content_type="application/json")


def add_device_query_to_cache(request):
    """将设备探测信息加入到redis缓存队列"""
    if request.method == "POST":
        data = dict()
        post_data = json.loads(str(request.body, encoding='utf-8'))
        start_ids = post_data["ids"]
        # conn_redis = get_redis_connection()
        for id in start_ids:
            device_info = QueryDevice.objects.get(id=id)
            device_ip = device_info.snmp_host
            device_snmp_port = device_info.snmp_port
            device_snmp_group = device_info.snmp_group
            # todo 将任务添加到redis缓存
            r.rpush(conf_data['DEVICE_QUERY_QUEUE'], "{0} {1} {2}".format(device_ip, device_snmp_port, device_snmp_group))
            logging.info("{0} {1} {2} 加入redis缓存队列".format(device_ip, device_snmp_port, device_snmp_group))
            # 设置探测任务的状态为启动中
            QueryDevice.objects.filter(snmp_host=device_ip).update(query_status=1, last_mod_time=datetime.datetime.now())

        data["status"] = "success"

        return HttpResponse(json.dumps(data), content_type="application/json")


def exec_device_query_task(request):
    """执行设备探测任务"""
    if request.method == "POST":
        ip = request.POST.get("ip")
        community = request.POST.get("community")
        port = request.POST.get("port")

        nm = nmap.PortScanner()
        ret = nm.scan(hosts=ip, arguments='-sU -p {0}'.format(port))
        logging.info("nmap scan result:{0}".format(ret))

        if not ret['scan']:
            QueryDevice.objects.filter(snmp_host=ip).update(query_status=3, last_mod_time=datetime.datetime.now())
            data = {
                "status": "fail",
                "device_info": "ip:{0} network failure".format(ip)
            }
        elif ret['scan'][ip]['udp'][int(port)]['state'] != 'open':
            QueryDevice.objects.filter(snmp_host=ip).update(query_status=5, last_mod_time=datetime.datetime.now())
            data = {
                "status": "fail",
                "device_info": "port:{0} close".format(port)
            }
        else:
            try:
                QueryDevice.objects.filter(snmp_host=ip).update(query_status=6, last_mod_time=datetime.datetime.now())
                device_object = device_query_fun.deviceQuery(community, ip, port)
                results = device_object.get_all_infos()
                logging.info("开始执行设备探测任务,ip:{0}, port:{1}, community:{2}".format(ip, port, community))
                device_host_name = device_object.device_name
                device_manufacturer_info = device_object.enterprise_code
                ip_num = ipv4_to_num(ip)
                networks = []
                for result in results:
                    network_info = result["ip_setup"]
                    interface_name = result["name"]
                    if network_info:
                        ip_netmask = network_info.split(" ")[0].split("/")
                        port_ip, netmask = ip_netmask[0], ip_netmask[1]
                        network = str(IP(port_ip).make_net(netmask))
                        networks.append(network)
                        network_to_device_info = NetworkToDivice.objects.filter(network=network)
                        if network_to_device_info:
                            network_to_device_ip = json.loads(network_to_device_info[0].device_ip)
                            if ip not in network_to_device_ip:
                                network_to_device_ip.append(ip)
                                network_to_device_hostname = json.loads(network_to_device_info[0].device_hostname)
                                network_to_device_interface = json.loads(network_to_device_info[0].interface)
                                network_to_device_hostname.append(device_host_name)
                                network_to_device_interface.append(interface_name)
                                network_to_device_info.update(
                                                    device_ip=str(network_to_device_ip).replace("'", '"'),
                                                    device_hostname=str(network_to_device_hostname).replace("'", '"'),
                                                    interface=str(network_to_device_interface).replace("'", '"')
                                )
                        else:
                            NetworkToDivice.objects.create(
                                                    network=network,
                                                    device_ip=str([ip]).replace("'", '"'),
                                                    device_hostname=str([device_host_name]).replace("'", '"'),
                                                    interface=str([interface_name]).replace("'", '"')
                                                           )

                    result = {
                        "snmp_host": ip,
                        "snmp_host_int": ip_num,
                        "if_name": interface_name,
                        "if_speed": result["speed"],
                        "if_descrs": result["if_descrs"],
                        "if_operstatus": result["status"],
                        "if_ip_setup": network_info,
                        "arp_infos": result["arp_infos"],
                        "brige_macs": result["brige_macs"],
                        "if_index": result["index"],
                        "last_mod_time": datetime.datetime.now()
                    }
                    if SnmpQueryResult.objects.filter(snmp_host_int=ipv4_to_num(ip), if_index=result["if_index"]):
                        SnmpQueryResult.objects.filter(snmp_host_int=ipv4_to_num(ip), if_index=result["if_index"]).update(**result)
                    else:
                        SnmpQueryResult.objects.create(**result)
                """写入路由表信息到数据库"""
                device_ip_route_tables = device_object.package_ip_route_table()
                for route_infos in device_ip_route_tables:
                    route_infos["snmp_host"] = ip
                    route_infos["snmp_host_int"] = ip_num
                    route_infos["last_mod_time"] = datetime.datetime.now()
                    if SnmpQueryIpRouteTable.objects.filter(snmp_host_int=ip_num, dest_ip=route_infos["dest_ip"]):
                        SnmpQueryIpRouteTable.objects.filter(snmp_host_int=ip_num, dest_ip=route_infos["dest_ip"]).update(**route_infos)
                    else:
                        SnmpQueryIpRouteTable.objects.create(**route_infos)

                QueryDevice.objects.filter(snmp_host=ip).update(
                    device_hostname=device_host_name,
                    device_manufacturer_info=device_manufacturer_info,
                    query_status=2,
                    networks=str(networks).replace("'", '"'),
                    last_mod_time=datetime.datetime.now()
                        )
                data = {
                    "status": "success",
                    "device_info": "ip:{0}, port:{1}, community:{2}".format(ip, port, community)
                }
            except Exception as e:
                QueryDevice.objects.filter(snmp_host=ip).update(query_status=4, last_mod_time=datetime.datetime.now())
                logger.error("探测任务执行失败：{0}".format(e))
                data = {
                    "status": "fail",
                }
                QueryDevice.objects.filter(snmp_host=ip).update(query_status=4, last_mod_time=datetime.datetime.now())
        return HttpResponse(json.dumps(data), content_type="application/json")


def get_device_details(request, parameter):
    """获取设备探测的详细信息"""
    device_info = QueryDevice.objects.get(snmp_host=parameter)
    device_details = SnmpQueryResult.objects.filter(snmp_host_int=device_info.snmp_host_int)

    data = dict()
    result = []
    for port_info in device_details:
        tmp_data = dict()
        tmp_data['key'] = port_info.id
        tmp_data["port_name"] = port_info.if_name
        if_speed = int(int(port_info.if_speed)/10**6)
        tmp_data["port_speed"] = "{0} Mbps".format(str(if_speed))
        if "down" in port_info.if_operstatus:
            if_operstatus = "down"
        elif "up" in port_info.if_operstatus:
            if_operstatus = "up"
        else:
            if_operstatus = 'unknown'
        tmp_data["port_status"] = if_operstatus
        tmp_data["port_setup"] = port_info.if_ip_setup
        tmp_data["port_index"] = port_info.if_index
        tmp_data["port_desc"] = port_info.if_descrs
        tmp_data["brige_macs"] = port_info.brige_macs.replace("'", '"')
        tmp_data["arp_table"] = port_info.arp_infos.replace("'", '"')

        result.append(tmp_data)
    data['result'] = result
    data["status"] = "success"
    return HttpResponse(json.dumps(data), content_type="application/json")


def get_device_port_macs(request, parameter):
    """
    获取设备端口对应的所有mac地址（即端口对应的转发表）
    """
    port_info = SnmpQueryResult.objects.get(id=parameter)
    if_name = port_info.if_name
    macs = port_info.brige_macs.replace("'", '"')
    macs = json.loads(macs)
    data = dict()
    result = []
    for mac in macs:
        tmp_data = dict()
        tmp_data['key'] = mac
        tmp_data["port_name"] = if_name
        tmp_data["mac"] = mac
        result.append(tmp_data)
    data['result'] = result
    data["status"] = "success"
    return HttpResponse(json.dumps(data), content_type="application/json")


def get_device_port_arp(request, parameter):
    """
    获取设备端口对应的所有arp信息（即mac和ip地址对应关系）
    """
    port_info = SnmpQueryResult.objects.get(id=parameter)
    if_name = port_info.if_name
    arp_infos = port_info.arp_infos.replace("'", '"')
    arp_infos = json.loads(arp_infos)
    data = dict()
    result = []
    for arp_info in arp_infos:
        tmp_data = dict()
        arp_info=arp_info.split(" ")
        tmp_data['key'] = arp_info[0]
        tmp_data["port_name"] = if_name
        tmp_data["ip"] = arp_info[0]
        tmp_data["mac"] = arp_info[1]
        result.append(tmp_data)
    data['result'] = result
    data["status"] = "success"
    return HttpResponse(json.dumps(data), content_type="application/json")


def get_device_query_crontab_task(request, parameter):
    """获取设备探测所有定时任务"""
    data = dict()
    result = dict()
    if parameter == "all":
        all_device = QueryDevice.objects.all()
        for device in all_device:
            if device.auto_enable:
                device_info = "{0} {1} {2}".format(device.snmp_host, device.snmp_port, device.snmp_group)
                result[device_info] = device.crontab_time
    else:
        try:
            device = QueryDevice.objects.get(snmp_host=parameter)
            if device and device.auto_enable:
                device_info = "{0} {1} {2}".format(device.snmp_host, device.snmp_port, device.snmp_group)
                result[device_info] = device.crontab_time
        except Exception as e:
            logging.error(e)
    data["status"] = "success"
    data['result'] = result
    return HttpResponse(json.dumps(data), content_type="application/json")


