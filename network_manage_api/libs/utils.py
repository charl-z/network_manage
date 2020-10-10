# -*- coding: utf-8 -*-

import datetime
import json
import redis
import yaml
import requests
import psycopg2
from libs.IPy import IP

weeks = {
    "星期一": "1",
    "星期二": "2",
    "星期三": "3",
    "星期四": "4",
    "星期五": "5",
    "星期六": "6",
    "星期天": "7",
}


def get_conf_handle(path=r'/opt/network_manage/network_manage_api/conf/config.yml'):
	conf = open(path)
	conf_data = yaml.load(conf, Loader=yaml.FullLoader)
	return conf_data


conf_data = get_conf_handle()
r = redis.Redis(host=conf_data['REDIS_CONF']['host'],
                port=conf_data['REDIS_CONF']['port'],
                password=conf_data['REDIS_CONF']['password'],
                decode_responses=True, db=1
                )

def connect_postgresql_db():
	try:
		conn = psycopg2.connect(
							database=conf_data['PostgreSQL']['database'],
							user=conf_data['PostgreSQL']['username'],
							# password='**',
							host=conf_data['PostgreSQL']['host'],
							port=conf_data['PostgreSQL']['port']
							)
	except Exception as e:
		print(e)
	else:
		return conn
	return None



def close_db_connection(conn):
	conn.commit()
	conn.close()


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
	response = requests.get('http://127.0.0.1:8000/device_query/device_query_crontab_task/{0}/'.format(ip))
	result = response.json()
	return result['result']


def get_network_query_crontab_task(network="all"):
	"""
	获取ip对应的设备探测任务
	:param ip: 如果ip=all,则获取所有的设备探测任务，如果ip=10.1.101.1，则只获取10.1.101.1对应的探测任务
	:return:
	{
	'10.1.107.0/24&22&53': '["45 1 8 * *"]',
	'10.1.108.0/24&22&': '["30 1 8 * *"]'
	}
	"""
	# 字符串有/时候，url解析时候会有问题
	response = requests.get('http://127.0.0.1:8000/network_query/network_query_crontab_task/?network={0}'.format(network.replace("/", "$")))
	result = response.json()
	return result['result']


def add_crontab_task_to_redis(crontabs, redis_key=conf_data["DEVICE_QUETY_CRONTAB_HASH"]):
	"""
	:param crontab_task: {'10.1.101.1 161 public': '["15 * * * *", "15 5 * * *", "30 18 * * 2", "0 0 1 * *"]', '10.1.101.2': '["30 * * * *"]', '10.1.101.4': '["30 0 * * *"]'}
	:param redis_key conf_data["DEVICE_QUETY_CRONTAB_HASH"]，保存在redis的key值
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
		r.hset(name=redis_key, key=ip, value=str(temp_crontab_time))


# 解析定时任务中的时间
def analysis_cron_time(cron):
	"""
    :param cron:{'model_0': '每小时', 'minute_0': '30', 'model_1': '每天', 'hour_1': '0:45', 'model_2': '每周', 'week_2': '星期三', 'hour_2': '0:45', 'model_3': '每月', 'day_3': '4号', 'hour_3': '19:30'}
    :return:['30 * * * *', '45 0 * * *', '45 0 * * 3', '30 19 4 * *']
    """
	result = {}
	count = 0
	for res in cron.keys():
		if "model" in res:
			count += 1
	for i in range(0, count):
		if cron.get("model_" + str(i)) == "每小时":
			minute = cron.get("minute_" + str(i))
			result[i] = "{0} * * * *".format(minute)
		if cron.get("model_" + str(i)) == "每天":
			hour = cron.get("hour_" + str(i))
			hour = hour.split(":")
			result[i] = "{0} {1} * * *".format(hour[1], hour[0])
		if cron.get("model_" + str(i)) == "每月":
			day = cron.get("day_" + str(i))
			hour = cron.get("hour_" + str(i))
			hour = hour.split(":")
			result[i] = "{0} {1} {2} * *".format(hour[1], hour[0], day[:-1])
		if cron.get("model_" + str(i)) == "每周":
			week = cron.get("week_" + str(i))
			hour = cron.get("hour_" + str(i))
			hour = hour.split(":")
			result[i] = "{0} {1} * * {2}".format(hour[1], hour[0], weeks[week])
	return str(list(result.values()))


def insert_query_data(network):
	# 将网络探测或设备探测的数据插入ip_detail_info的表中
	try:
		conn_psql = connect_postgresql_db()
		cur_psql = conn_psql.cursor()

		print("network*****:", network)

		SQL = "SELECT ip, mac, host_and_port, query_time FROM device_query_arp_table WHERE network='{0}';".format(network)
		cur_psql.execute(SQL)
		device_query_arp_table_info = cur_psql.fetchall()
		device_query_arp_table_dict = dict()
		for i in device_query_arp_table_info:
			device_query_arp_table_dict[i[0]] = list(i)

		SQL = "SELECT ip, scan_mac, tcp_port_list, udp_port_list, hostname, query_time FROM network_query_result WHERE network='{0}';".format(network)
		cur_psql.execute(SQL)
		network_query_result_info = cur_psql.fetchall()
		network_query_result_dict = dict()
		for i in network_query_result_info:
			network_query_result_dict[i[0]] = list(i)

		arp_ips = device_query_arp_table_dict.keys()
		network_query_ips = network_query_result_dict.keys()

		arp_ips_difference_query = set(arp_ips).difference(set(network_query_ips))
		network_query_ips_difference_arp = set(network_query_ips).difference(set(arp_ips))
		arps_query_mixed = set(network_query_ips) & set(arp_ips)


		padding_data = {
			'query_arp_mac': '',
			'device_hostname_interface': '',
			'tcp_port_list': '',
			'udp_port_list': '',
			'hostname': '',
			'ip_status': 1,
			'ip_type': 0,
			'manual_mac': '',
			'created_time': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
		}
		padding_network_query = [
			padding_data['tcp_port_list'],
			padding_data['udp_port_list'],
			padding_data['hostname'],
			padding_data['ip_status'],
			padding_data['ip_type'],
			padding_data['manual_mac'],
			padding_data['created_time'],
		]
		padding_arp = [
			padding_data['ip_status'],
			padding_data['ip_type'],
			padding_data['manual_mac'],
			padding_data['created_time'],
			padding_data['device_hostname_interface'],
		]

		padding_mixed = [
			padding_data['ip_status'],
			padding_data['ip_type'],
			padding_data['manual_mac'],
			padding_data['created_time'],
		]

		arp_ips_difference_query_info = []
		for i in arp_ips_difference_query:
			ip_detail_info = device_query_arp_table_dict[i]
			query_time = ip_detail_info.pop()
			ip_detail_info.extend(padding_network_query)
			ip_detail_info.append(str(query_time))
			ip_detail_info.append(network)
			arp_ips_difference_query_info.append(tuple(ip_detail_info))

		SQL = "INSERT INTO ip_detail_info(ip, query_arp_mac, device_hostname_interface, tcp_port_list, udp_port_list, hostname, ip_status, ip_type, manual_mac, created_time, query_time, network) VALUES "
		if arp_ips_difference_query_info:
			for i in arp_ips_difference_query_info:
				SQL += str(i) + ","
			SQL = SQL[:-1] + ";"
			cur_psql.execute(SQL)

		SQL = "INSERT INTO ip_detail_info(ip, query_arp_mac, tcp_port_list, udp_port_list, hostname, ip_status, ip_type, manual_mac, created_time, device_hostname_interface, query_time, network) VALUES "
		network_query_ips_difference_arp_info = []
		for i in network_query_ips_difference_arp:
			ip_detail_info = network_query_result_dict[i]
			query_time = ip_detail_info.pop()
			ip_detail_info.extend(padding_arp)

			ip_detail_info.append(str(query_time))
			ip_detail_info.append(network)
			network_query_ips_difference_arp_info.append(tuple(ip_detail_info))

		if network_query_ips_difference_arp_info:
			for i in network_query_ips_difference_arp_info:
				SQL += str(i) + ","
			SQL = SQL[:-1] + ";"
			cur_psql.execute(SQL)

		arps_query_mixed_info = []
		SQL = "INSERT INTO ip_detail_info(ip, query_arp_mac, device_hostname_interface, tcp_port_list, udp_port_list, hostname, ip_status, ip_type, manual_mac, created_time, query_time, network) VALUES "
		for i in arps_query_mixed:
			arps_info = device_query_arp_table_dict[i]
			query_time = arps_info.pop()
			network_query_info = network_query_result_dict[i]
			network_query_info.pop()
			if network_query_info[1] and arps_info[1] != network_query_info[1] : # 设备探测和网络探测的IP对应的MAC不一致
				print("{0}:设备探测和网络探测的IP对应的MAC不一致".format(arps_info[0]))
			arps_info.extend(network_query_info[2:])
			arps_info.extend(padding_mixed)
			arps_info.append(str(query_time))
			arps_info.append(network)
			arps_query_mixed_info.append(tuple(arps_info))
		if arps_query_mixed_info:
			for i in arps_query_mixed_info:
				SQL += str(i) + ","
			SQL = SQL[:-1] + ";"
			cur_psql.execute(SQL)











	finally:
		close_db_connection(conn_psql)




	# print(network_query_result_info)





if __name__ == "__main__":
	# a = {'community': 'public', 'port': 161, 'device_ips': '100.1.1.1', 'crontab_task': 'on', 'model_0': '每小时', 'minute_0': '30', 'model_1': '每天', 'hour_1': '0:45', 'model_2': '每周', 'week_2': '星期三', 'hour_2': '0:45', 'model_3': '每月', 'day_3': '4号', 'hour_3': '19:30'}
	# print(analysis_cron_time(a))
	print(insert_query_data("10.1.108.0/24"))
