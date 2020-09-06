#!/usr/bin/python
# -*- coding: utf-8 -*-
# @Time    : 2020/8/15 14:42
# @Author  : weidengyi
import sys
import os
import time
import redis
import logging
import datetime
import json
from libs.utils import get_conf_handle, get_device_query_crontab_task, add_crontab_task_to_redis, get_network_query_crontab_task
from libs.IPy import IP


conf_data = get_conf_handle()
logging.basicConfig(
					level=logging.DEBUG,
					format=conf_data["LOG_SETUP"]["LOG_FORMAT"],
					datefmt=conf_data["LOG_SETUP"]["DATE_FORMAT"],
					filename=conf_data["LOG_SETUP"]["SERVICE_MONITOR_PATH"]
					)
r = redis.Redis(
				host=conf_data['REDIS_CONF']['host'],
				port=conf_data['REDIS_CONF']['port'],
				password=conf_data['REDIS_CONF']['password'],
				decode_responses=True, db=1
				)

def handle_device_query_redis_crontab_task():
	"""
	从定时任务哈希表中获取所有设备对应设备探测任务时间，如果当前时间大于定时任务的里面，则把该定时任务加入到redis缓存中排队
	"""
	all_crontab_tasks = r.hgetall(conf_data["DEVICE_QUETY_CRONTAB_HASH"])
	now = int(datetime.datetime.now().timestamp())
	for device_info in all_crontab_tasks.keys():
		crontab_times = json.loads(all_crontab_tasks[device_info])
		for crontab_time in crontab_times:
			if now > int(crontab_time):
				device_info = device_info.split(" ")
				device_ip, device_snmp_port, device_snmp_group = device_info[0], device_info[1], device_info[2]
				r.rpush(conf_data['DEVICE_QUERY_QUEUE'], "{0} {1} {2}".format(device_ip, device_snmp_port, device_snmp_group))
				logging.info("{0} {1} {2}, 加入设备探测redis缓存队列".format(device_ip, device_snmp_port, device_snmp_group))
				# todo 定时任务加入缓存列表后重新更新定时任务的哈希表
				device_query_crontab_task_info = get_device_query_crontab_task(ip=device_info[0])
				add_crontab_task_to_redis(device_query_crontab_task_info, conf_data["DEVICE_QUETY_CRONTAB_HASH"])
				logging.info("更新设备定时任务：{0}".format(device_query_crontab_task_info))


def handle_network_query_redis_crontab_task():
	"""
	从定时任务哈希表中获取所有设备对应网络探测任务时间，如果当前时间大于定时任务的里面，则把该定时任务加入到redis缓存中排队
	"""
	all_crontab_tasks = r.hgetall(conf_data["NETWORK_QUETY_CRONTAB_HASH"])
	now = int(datetime.datetime.now().timestamp())
	for network_info in all_crontab_tasks:
		crontab_times = json.loads(all_crontab_tasks[network_info])
		for crontab_time in crontab_times:
			if now > int(crontab_time):
				network_info = network_info.split("&")
				network, tcp_query_ports, udp_query_ports = network_info[0], network_info[1], network_info[2]
				network_scan_redis_info = "{0}&{1}&{2}".format(network, tcp_query_ports, udp_query_ports)
				ips = IP(network)
				# 将网络中的每个IP地址的探测信息也加入redis环境，key值为network_scan_redis_info
				for ip in ips:
					ip = str(ip)
					r.rpush(network_scan_redis_info, ip)

				r.rpush(conf_data['NETWORK_QUERY_QUEUE'], network_scan_redis_info)
				logging.info("{0}&{1}&{2}, 加入到redis网络探测任务列表".format(network, tcp_query_ports, udp_query_ports))

				# todo 定时任务加入缓存列表后重新更新定时任务的哈希表
				network_query_crontab_task_info = get_network_query_crontab_task(network=network)
				add_crontab_task_to_redis(network_query_crontab_task_info, conf_data["NETWORK_QUETY_CRONTAB_HASH"])
				logging.info("更新定时任务：{0}".format(network_query_crontab_task_info))


if __name__ == "__main__":
	# redis服务器异常
	start_redis = "/usr/local/bin/redis-server /etc/redis.conf"
	command = "ps aux|grep ':{0}'|grep -v grep".format(conf_data['REDIS_CONF']['port'])
	values = os.popen(command)
	if not values.readlines():
		logging.info("redis服务异常:redis-server -p {0}，正常重启拉起".format(conf_data['REDIS_CONF']['port']))
		os.system(start_redis)
		# 检查Redis服务是否启动,
		time.sleep(15)
		values = os.popen(command)
		if values.readlines():
			logging.info("redis服务已启动:redis-server -p {0}，正常重启拉起".format(conf_data['REDIS_CONF']['port']))
			# todo 如果redis重启，需要重新将所有设备探测的定时任务重新写入redis哈希表中
			all_device_query_task = get_device_query_crontab_task("all")  # 获取数据库中所有的设备探测定时任务
			add_crontab_task_to_redis(all_device_query_task, conf_data["DEVICE_QUETY_CRONTAB_HASH"])  # 将所有的设备探测任务重新写入redis
			# todo 如果redis重启，需要重新将所有网络探测的定时任务重新写入redis哈希表中
			all_network_query_task = get_network_query_crontab_task('all')  # 获取数据库中所有的设备探测定时任务
			add_crontab_task_to_redis(all_network_query_task, conf_data["NETWORK_QUETY_CRONTAB_HASH"])  # 将所有的设备探测任务重新写入redis

	# 监控设备探测任务
	device_query_cron = "nohup {0} {1}&".format(conf_data["PYTHON_PATH"], conf_data["SCRIPT_PATH"]["DEVICE_QUERY_CRON_PATH"])
	command = "ps aux|grep device_query_cron|grep -v grep"
	values = os.popen(command)
	if not values.readlines():
		logging.info("设备探测服务异常(device_query_cron.py)，重启拉起")
		os.system(device_query_cron)

	# 监控网络探测任务
	network_query_cron = "nohup {0} {1}&".format(conf_data["PYTHON_PATH"],
												conf_data["SCRIPT_PATH"]["NETWORK_QUERY_CRON_PATH"])
	command = "ps aux|grep network_query_cron|grep -v grep"
	values = os.popen(command)
	if not values.readlines():
		logging.info("网络探测服务异常(device_query_cron.py)，重启拉起")
		os.system(network_query_cron)

	# 查询redis哈希表,设备探测任务是需要设备探测缓存列表中
	handle_device_query_redis_crontab_task()

	# 查询redis哈希表,网络探测任务是需要设备探测缓存列表中
	handle_network_query_redis_crontab_task()
