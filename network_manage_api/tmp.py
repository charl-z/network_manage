import requests
import yaml
import redis

import json
import datetime
import logging
import time

LOG_FORMAT = "%(asctime)s %(name)s %(levelname)s %(filename)s %(lineno)d   %(message)s "#配置输出日志格式
DATE_FORMAT = '%Y-%m-%d  %H:%M:%S' #配置输出时间的格式，注意月份和天数不要搞乱了

logging.basicConfig(level=logging.DEBUG,
                    format=LOG_FORMAT,
                    datefmt=DATE_FORMAT ,
                    filename="./log/zcron.log" #有了filename参数就不会直接输出显示到控制台，而是直接写入文件
                    )

conf = open(r'/opt/network_manage/conf/config.yml')
conf_data = yaml.load(conf, Loader=yaml.FullLoader)
r = redis.Redis(host=conf_data['REDIS_CONF']['host'],
                port=conf_data['REDIS_CONF']['port'],
                password=conf_data['REDIS_CONF']['password'],
                decode_responses=True, db=1
                )


def get_device_query_crontab_task(ip="all"):
	"""
	获取ip对应的设备探测任务
	:param ip: 如果ip=all,则获取所有的设备探测任务，如果ip=10.1.101.1，则只获取10.1.101.1对应的探测任务
	:return:
	{
	'10.1.101.1 161 public': '["15 * * * *", "15 5 * * *", "30 18 * * 2", "0 0 1 * *"]',
	'10.1.101.2 161 public': '["30 * * * *", "15 6 * * 5"]',
	'10.1.101.4 161 public': '["45 * * * *"]'
	}
	"""
	response = requests.get('http://127.0.0.1:8000/api/device_query_crontab_task/{0}/'.format(ip))
	result = response.json()
	return result['result']


def add_crontab_task_to_redis(crontabs):
	"""
	:param crontab_task: {'10.1.101.1': '["15 * * * *", "15 5 * * *", "30 18 * * 2", "0 0 1 * *"]', '10.1.101.2': '["30 * * * *"]', '10.1.101.4': '["30 0 * * *"]'}
	:return:
	"""
	"""
	按照每个月28计算
	如果定时任务是，每月得某一天执行，比如是每月得15号1:45执行，获取当前得时间戳，替换day、hour、minute分别15，1，45，然后与当前得时间进行对比，
	如果当前得时间小于替换后得时间，则使用替换后得时间，
	如果当前得时间大于替换后得时间，则下个月在执行
	如果定时任务是，每天执行，比如是23:59，获取当前得时间戳，替换hour、minute分别23、59，然后与当前得时间进行对比，
	如果当前得时间小于替换后得时间，则使用替换后得时间
	如果当前得时间大于替换后得时间，则第二天在执行
	"""
	now = datetime.datetime.now()
	for ip in crontabs.keys():
		temp_crontab_time = []
		for crontab_time in json.loads(crontabs[ip]):
			crontab_time = crontab_time.split(" ")
			if crontab_time[1] == "*" and crontab_time[2] == "*" and crontab_time[3] == "*" and crontab_time[4] == "*":
				minute = int(crontab_time[0])
				exec_time = now.replace(minute=minute)
				if now > exec_time:
					if now.hour == 23:
						exec_time = now.replace(day=now.day + 1, hour=0, minute=minute)
					else:
						exec_time = now.replace(hour=now.hour + 1, minute=minute)

			elif crontab_time[2] == "*" and crontab_time[3] == "*" and crontab_time[4] == "*":
				minute = int(crontab_time[0])
				hour = int(crontab_time[1])
				exec_time = now.replace(hour=hour, minute=minute)
				if now > exec_time:  # 这里可能存在一个问题，如果当月只有28天，可能存在问题
					exec_time = now.replace(day=now.day + 1, hour=hour, minute=minute)
			elif crontab_time[2] != "*":
				minute = int(crontab_time[0])
				hour = int(crontab_time[1])
				day = int(crontab_time[2])
				exec_time = now.replace(day=day, hour=hour, minute=minute)
				if now > exec_time:  #
					if now.month == 12:
						exec_time = now.replace(year=now.year + 1, month=1, day=day, hour=hour, minute=minute)
					else:
						exec_time = now.replace(month=now.month + 1, day=day, hour=hour, minute=minute)
			else:
				minute = int(crontab_time[0])
				hour = int(crontab_time[1])
				week = int(crontab_time[4])
				now_week = now.isoweekday()
				exec_time = now.replace(hour=hour, minute=minute)
				if now_week > week:
					days = 7 - now_week + week
					exec_time = now.replace(hour=hour, minute=minute) + datetime.timedelta(days=days)
				elif now_week == week:
					if now > exec_time:
						exec_time = now.replace(hour=hour, minute=minute) + datetime.timedelta(days=7)
				else:
					days = week - now_week
					exec_time = now.replace(hour=hour, minute=minute) + datetime.timedelta(days=days)
			temp_crontab_time.append(int(exec_time.timestamp()))
		r.hset(name=conf_data["DEVICE_QUETY_CRONTAB_HASH"], key=ip, value=temp_crontab_time)


def handle_redis_crontab_task():
	"""
	从定时任务哈希表中对应设备探测任务时间，如果当前时间大于定时任务的里面，则把该定时任务加入到redis缓存中排队
	"""
	all_crontab_tasks = r.hgetall(conf_data["DEVICE_QUETY_CRONTAB_HASH"])
	now = int(datetime.datetime.now().timestamp())
	for device_info in all_crontab_tasks.keys():
		crontab_times = json.loads(all_crontab_tasks[device_info])
		for crontab_time in crontab_times:
			if now > int(crontab_time):
				logging.info("定时任务执行设备探测信息:{0}".format(device_info))
				device_info = device_info.split(" ")
				device_ip, device_snmp_port, device_snmp_group = device_info[0], device_info[1], device_info[2]
				r.rpush(conf_data['DEVICE_QUERY_QUEUE'], "{0} {1} {2}".format(device_ip, device_snmp_port, device_snmp_group))

				# todo 定时任务加入缓存列表后重新更新定时任务的哈希表
				device_query_crontab_task_info = get_device_query_crontab_task(ip=device_info[0])
				add_crontab_task_to_redis(device_query_crontab_task_info)


if __name__ == "__main__":
	print(conf_data['DEVICE_QUERY_QUEUE'])
	r.lrem(conf_data['DEVICE_QUERY_QUEUE'], "10.1.101.1", 1)
	# print(get_device_query_crontab_task("all"))
	# # while True:
	# # 	get_redis_crontab_task()
	# # 	time.sleep(60)