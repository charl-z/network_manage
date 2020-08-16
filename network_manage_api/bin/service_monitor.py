#!/usr/bin/python
# -*- coding: utf-8 -*-
# @Time    : 2020/8/15 14:42
# @Author  : weidengyi
import sys
import os
import time
import yaml
import redis
import logging
import datetime
import json

conf = open(r'/opt/network_manage/conf/config.yml')
conf_data = yaml.load(conf, Loader=yaml.FullLoader)

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

try:
	sys.path.append(conf_data["SERVICE_INSTALL_PATH"])
	from libs.utils import get_device_query_crontab_task, add_crontab_task_to_redis
except Exception as e:
	logging.error("添加系统环境变量出错，请检查！")


def handle_redis_crontab_task():
	"""
	从定时任务哈希表中获取所有设备对应设备探测任务时间，如果当前时间大于定时任务的里面，则把该定时任务加入到redis缓存中排队
	"""
	try:
		all_crontab_tasks = r.hgetall(conf_data["DEVICE_QUETY_CRONTAB_HASH"])
		now = int(datetime.datetime.now().timestamp())
		for device_info in all_crontab_tasks.keys():
			crontab_times = json.loads(all_crontab_tasks[device_info])
			for crontab_time in crontab_times:
				if now > int(crontab_time):
					device_info = device_info.split(" ")
					device_ip, device_snmp_port, device_snmp_group = device_info[0], device_info[1], device_info[2]
					r.rpush(conf_data['DEVICE_QUERY_QUEUE'], "{0} {1} {2}".format(device_ip, device_snmp_port, device_snmp_group))

					# todo 定时任务加入缓存列表后重新更新定时任务的哈希表
					device_query_crontab_task_info = get_device_query_crontab_task(ip=device_info[0])
					add_crontab_task_to_redis(device_query_crontab_task_info)
	except Exception as e:
		logging.error("遍历定时任务哈希表失败，请检查！")


if __name__ == "__main__":
	# redis服务器异常
	start_redis = "/usr/local/bin/redis-server /etc/redis.conf"
	command = "ps aux|grep ':{0}'|grep -v grep".format(conf_data['REDIS_CONF']['port'])
	values = os.popen(command)
	if not values.readlines():
		logging.info("redis服务异常:redis-server -p {0}，正常重启拉起".format(conf_data['REDIS_CONF']['port']))
		os.system(start_redis)
		time.sleep(5)
		# 如果redis重启，需要重新将所有设备探测的定时任务重新写入redis哈希表中
		all_device_query_task = get_device_query_crontab_task("all")
		add_crontab_task_to_redis(all_device_query_task)

	# 监控设备探测任务
	device_query_cron = "nohup python {0}&".format(conf_data["SCRIPT_PATH"]["DEVICE_QUERY_CRON_PATH"])
	command = "ps aux|grep device_query_cron|grep -v grep"
	values = os.popen(command)
	if not values.readlines():
		logging.info("设备探测服务异常(device_query_cron.py)，重启拉起")
		os.system(device_query_cron)

	# 查询redis哈希表,设备探测任务是需要设备探测缓存列表中
	handle_redis_crontab_task()
