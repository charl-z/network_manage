from django.http import HttpResponse
from django.core.paginator import Paginator
import json
from libs.IPy import checkNetwork, IP
from libs.tool import json_encoder, ipv4_to_num, num_to_ipv4
from libs.network_query_fun import NetworkQuery
from network_query.models import NetworkQueryList, NetworkQueryDetails
import datetime
import redis
import threading
import logging
from libs.utils import get_conf_handle, analysis_cron_time, add_crontab_task_to_redis

conf_data = get_conf_handle()

r = redis.Redis(host=conf_data['REDIS_CONF']['host'],
                port=conf_data['REDIS_CONF']['port'],
                password=conf_data['REDIS_CONF']['password'],
                decode_responses=True,
                db=conf_data['REDIS_CONF']['db']
                )

logging.basicConfig(
					level=logging.INFO,
					format=conf_data["LOG_SETUP"]["LOG_FORMAT"],
					datefmt=conf_data["LOG_SETUP"]["DATE_FORMAT"],
					filename=conf_data["LOG_SETUP"]["NETWORK_MANAGE_MONITOR_PATH"]
					)


def get_network_query_info(request):
	data = dict()
	data['status'] = "success"
	page_size = request.GET.get("page_size")
	current_page = request.GET.get("current_page")

	search_network = request.GET.get("search_network")

	if search_network:
		all_networks = NetworkQueryList.objects.filter(network__contains=search_network)
	else:
		all_networks = NetworkQueryList.objects.all()

	result = []
	paginator = Paginator(all_networks, page_size)
	total_networks = all_networks.count()
	network_page = paginator.page(current_page)
	for network in network_page:
		network_info = dict()
		network_info['key'] = network.id
		network_info['network'] = network.network
		network_info['tcp_query_ports'] = network.tcp_query_ports
		network_info['udp_query_ports'] = network.udp_query_ports
		network_info['query_status'] = network.get_query_status_display()
		network_info['online_ip_num'] = network.online_ip_num
		network_info['auto_enable'] = network.auto_enable
		network_info['crontab_task'] = network.crontab_task
		network_info['query_time'] = (network.query_time + datetime.timedelta(hours=8)).strftime(
			"%Y-%m-%d %H:%M:%S")

		result.append(network_info)
	data['data'] = result
	data['total_network'] = total_networks
	data["status"] = "success"
	return HttpResponse(json.dumps(data), content_type="application/json")


def add_network_query(request):
	"""批量添加网络探测任务，设备探测信息写入到数据库"""
	if request.method == "POST":
		post_data = json.loads(str(request.body, encoding='utf-8'))
		networks = post_data["networks"].strip()
		tcp_query_ports = post_data["tcp_query_ports"].strip()
		udp_query_ports = post_data["udp_query_ports"].strip()
		crontab_task_status = post_data["crontab_task_status"]
		unvalid_network = []
		data = dict()

		# TCP探测端口校验
		if tcp_query_ports:
			try:
				query_ports_list = tcp_query_ports.split(",")
				query_ports_list = list(set(query_ports_list))
				for port in query_ports_list:
					int(port)
			except:
				unvalid_network.append("非法TCP扫描端口")
		# UDP探测端口校验
		if udp_query_ports:
			try:
				udp_query_ports_list = udp_query_ports.split(",")
				udp_query_ports_list = list(set(udp_query_ports_list))
				for port in udp_query_ports_list:
					int(port)
			except:
				unvalid_network.append("非法UDP扫描端口")

		auto_enable = False
		if crontab_task_status == "on":
			auto_enable = True
			crontab_task = analysis_cron_time(post_data)

		networks = networks.split(" ")
		for network in networks:
			try:
				if not checkNetwork(network):
					unvalid_network.append("{0} 非法网络".format(network))
				elif NetworkQueryList.objects.filter(network=network):
					unvalid_network.append("{0} 网络已存在".format(network))
				elif "/" not in network:
					unvalid_network.append("{0} 非法网络".format(network))
			except:
				unvalid_network.append("{0} 非法网络".format(network))
		if len(unvalid_network) == 0:
			for network in networks:
				NetworkQueryList.objects.create(
					network=network,
					tcp_query_ports=tcp_query_ports,
					udp_query_ports=udp_query_ports,
					auto_enable=auto_enable,
					crontab_task=crontab_task.replace("'", '"')
				)
				if auto_enable:  # 如果定时任务开启，则要更新redis哈希表中的定时任务数据
					crontab_task_dict = dict()
					crontab_task_dict["{0}&{1}&{2}".format(network, tcp_query_ports, udp_query_ports)] = crontab_task.replace("'", '"')
					add_crontab_task_to_redis(crontab_task_dict, conf_data["NETWORK_QUETY_CRONTAB_HASH"])
			data["status"] = "success"
		else:
			data["status"] = "fail"
			data["data"] = unvalid_network
		return HttpResponse(json.dumps(data), content_type="application/json")
	if request.method == "PUT":
		data = dict()
		post_data = json.loads(str(request.body, encoding='utf-8'))
		network = post_data["networks"].strip()
		tcp_query_ports = post_data["tcp_query_ports"].strip()
		udp_query_ports = post_data["udp_query_ports"].strip()
		crontab_task_status = post_data["crontab_task_status"]

		auto_enable = False
		if crontab_task_status == "on":
			auto_enable = True
			crontab_task = analysis_cron_time(post_data)
		NetworkQueryList.objects.filter(network=network).update(
																tcp_query_ports=tcp_query_ports,
																udp_query_ports=udp_query_ports,
																auto_enable=auto_enable,
																crontab_task=crontab_task.replace("'", '"')
																)

		if auto_enable:  # 如果定时任务开启，则要更新redis哈希表中的定时任务数据
			crontab_task_dict = dict()
			crontab_task_dict["{0}&{1}&{2}".format(network, tcp_query_ports, udp_query_ports)] = crontab_task.replace(
				"'", '"')
			add_crontab_task_to_redis(crontab_task_dict, conf_data["NETWORK_QUETY_CRONTAB_HASH"])
		data["status"] = "success"
		return HttpResponse(json.dumps(data), content_type="application/json")


def add_network_query_to_cache(request):
	if request.method == "POST":
		data = dict()
		post_data = json.loads(str(request.body, encoding='utf-8'))
		ids = post_data["ids"]
		if (isinstance(ids, int)):
			ids = [ids]
		for id in ids:
			network_scan_info = NetworkQueryList.objects.get(id=id)
			network = network_scan_info.network
			tcp_query_ports = network_scan_info.tcp_query_ports
			udp_query_ports =network_scan_info.udp_query_ports
			network_scan_redis_info = "{0}&{1}&{2}".format(network, tcp_query_ports, udp_query_ports)
			logging.info("{0}&{1}&{2}，加入到redis设备探测队列".format(network, tcp_query_ports, udp_query_ports))

			ips = IP(network)
			for ip in ips:
				ip = str(ip)
				r.rpush(network_scan_redis_info, ip)  # 将网络中的每个IP地址的探测信息也加入redis环境，key值为network_scan_redis_info
			r.rpush(conf_data['NETWORK_QUERY_QUEUE'], network_scan_redis_info)


			NetworkQueryList.objects.filter(network=network).update(
																query_status=4,
																query_time=datetime.datetime.now()
																)

		data["status"] = "success"
		return HttpResponse(json.dumps(data), content_type="application/json")


def exec_network_query_task(request):
	if request.method == "POST":
		data = dict()
		redis_network_info = request.POST.get("network")
		redis_network_info_list = redis_network_info.split("&")
		network = redis_network_info_list[0]
		NetworkQueryDetails.objects.filter(network=network).delete()  # 在执行网络探测前，先删除网络探测的数据
		network_scan = NetworkQuery()
		logging.info("执行网络探测任务：{0}".format(redis_network_info))
		t = threading.Thread(target=network_scan.exec_redis_task, args=(redis_network_info,))
		t.start()
		data["status"] = "success"
		return HttpResponse(json.dumps(data), content_type="application/json")


def del_network_query(request):
	"""
	批量删除网络探测任务
	"""
	if request.method == "POST":
		post_data = json.loads(str(request.body, encoding='utf-8'))
		data = dict()
		delete_ids = post_data["ids"]

		if(isinstance(delete_ids, int)):
			delete_ids = [delete_ids]

		for id in delete_ids:
			network_info = NetworkQueryList.objects.get(id=id)
			network = network_info.network
			tcp_query_ports = network_info.tcp_query_ports
			udp_query_ports = network_info.udp_query_ports
			print(network)
			# todo 删除network_query_result表中探测数据数据
			NetworkQueryDetails.objects.filter(network=network).delete()
			logging.info("删除网络探测任务：{0}".format(network))
			# todo 删除网络探测任务时候，需要将redis网络任务队里的定时任务同步删除
			network_scan_redis_info = "{0}&{1}&{2}".format(network, tcp_query_ports, udp_query_ports)
			r.lrem(conf_data['NETWORK_QUERY_QUEUE'], network_scan_redis_info, 0)
			logging.info("redis网络任务队里的定时任务同步删除：{0}".format(network_scan_redis_info))
			# todo 删除网络探测任务时候，需要将redis哈希表中的定时任务同步删除
			r.hdel(conf_data['NETWORK_QUETY_CRONTAB_HASH'], network_scan_redis_info)
			r.delete(network_scan_redis_info)
			logging.info("redis哈希表中的定时任务同步删除：{0}".format(network_scan_redis_info))

			NetworkQueryList.objects.filter(id=id).delete()
		data["status"] = "success"
		return HttpResponse(json.dumps(data), content_type="application/json")


def get_network_details(request):
	data = dict()
	id = request.GET.get("id")
	page_size = int(request.GET.get("page_size"))
	current_page = int(request.GET.get("current_page"))
	ip_status = request.GET.get("ip_status")
	ip_type = request.GET.get("ip_type")
	column_key = request.GET.get("columnKey")
	order = request.GET.get("order")
	# print("**********", page_size, current_page, ip_status,  ip_type, column_key, order)
	network_info = NetworkQueryList.objects.get(id=id)
	result = []
	network_details = NetworkQueryDetails.objects.filter(network=network_info.network, ip_status=1).order_by('ip')
	if ip_status == "1":
		if column_key == "ip":
			if order == 'descend':
				network_details = NetworkQueryDetails.objects.filter(network=network_info.network, ip_status=1).order_by('-ip')
			elif order == 'ascend':
				network_details = NetworkQueryDetails.objects.filter(network=network_info.network, ip_status=1).order_by('ip')
		paginator = Paginator(network_details, page_size)
		ips_page = paginator.page(current_page)
		for query in ips_page:
			ip_info = dict()
			ip_info["key"] = query.ip
			ip_info["ip"] = query.ip
			ip_info["network"] = query.network
			ip_info["ip_status"] = query.get_ip_status_display()
			ip_info["scan_mac_address"] = query.scan_mac
			ip_info["scan_mac_product"] = query.scan_mac_product
			ip_info["ip_type"] = query.get_ip_type_display()
			ip_info["hostname"] = query.hostname
			ip_info["tcp_port_list"] = query.tcp_port_list.replace("'", '"')
			ip_info["udp_port_list"] = query.udp_port_list.replace("'", '"')
			ip_info["query_time"] = query.query_time.strftime( "%Y-%m-%d %H:%M:%S")
			result.append(ip_info)
		data['result'] = result
		data['total_ips'] = network_details.count()
		data["status"] = "success"
		return HttpResponse(json.dumps(data), content_type="application/json")
	elif ip_status == "0":
			ips = IP(network_info.network)
			ip_start = str(ips.net())
			ip_end = str(ips.broadcast())
			all_ip = []
			for ip in range(ipv4_to_num(ip_start), ipv4_to_num(ip_end) + 1):
				all_ip.append(num_to_ipv4(ip))

			online_ip = NetworkQueryDetails.objects.values_list('ip', flat=True).filter(network=network_info.network, ip_status=1)
			offline_ip_db = NetworkQueryDetails.objects.filter(network=network_info.network, ip_status=0)

			online_ip = list(online_ip)
			offline_ip = list(set(all_ip).difference(set(online_ip)))
			offline_ip.sort()
			if column_key == "ip":
				if order == 'descend':
					offline_ip.sort(reverse=True)
				elif order == 'ascend':
					offline_ip.sort(reverse=False)
			scan_ips_info = dict()
			for query in offline_ip_db:
				ip_info = dict()
				ip_info["network"] = query.network
				ip_info["ip_status"] = query.get_ip_status_display()
				ip_info["scan_mac_address"] = query.scan_mac
				ip_info["scan_mac_product"] = query.scan_mac_product
				ip_info["ip_type"] = query.get_ip_type_display()
				ip_info["hostname"] = query.hostname
				ip_info["tcp_port_list"] = query.tcp_port_list
				ip_info["udp_port_list"] = query.udp_port_list
				ip_info["query_time"] = query.query_time
				scan_ips_info[query.ip] = ip_info
			scan_ips = list(scan_ips_info.keys())
			current_page = current_page - 1
			for ip in offline_ip[current_page*page_size : current_page*page_size+page_size]:
				scan_ip_infos = dict()
				if ip in scan_ips:
					scan_ip_infos["key"] = ip
					scan_ip_infos["ip"] = ip
					scan_ip_infos["network"] = scan_ips_info[ip]["network"]
					scan_ip_infos["ip_status"] = scan_ips_info[ip]["ip_status"]
					scan_ip_infos["scan_mac_address"] = scan_ips_info[ip]["scan_mac_address"]
					scan_ip_infos["scan_mac_product"] = scan_ips_info[ip]["scan_mac_product"]
					scan_ip_infos["ip_type"] = scan_ips_info[ip]["ip_type"]
					scan_ip_infos["hostname"] = scan_ips_info[ip]["hostname"]
					scan_ip_infos["tcp_port_list"] = scan_ips_info[ip]["tcp_port_list"].replace("'", '"')
					scan_ip_infos["udp_port_list"] = scan_ips_info[ip]["udp_port_list"].replace("'", '"')
					scan_ip_infos["query_time"] = scan_ips_info[ip]["query_time"]
				else:
					scan_ip_infos["key"] = ip
					scan_ip_infos["ip"] = ip
					scan_ip_infos["network"] = network_info.network
					scan_ip_infos["ip_status"] = "离线"
					scan_ip_infos["scan_mac_address"] = ""
					scan_ip_infos["scan_mac_product"] = ""
					scan_ip_infos["ip_type"] = "未使用"
					scan_ip_infos["hostname"] = ""
					scan_ip_infos["tcp_port_list"] = ""
					scan_ip_infos["udp_port_list"] = ""
					scan_ip_infos["query_time"] = network_info.query_time

				result.append(scan_ip_infos)
			data['result'] = result
			data['total_ips'] = len(offline_ip)
			data["status"] = "success"
			return HttpResponse(json.dumps(data, cls=json_encoder), content_type="application/json")

	else:
		network_details = NetworkQueryDetails.objects.filter(network=network_info.network)
		scan_ips_info = dict()
		for query in network_details:
			ip_info = dict()
			ip_info["network"] = query.network
			ip_info["ip_status"] = query.get_ip_status_display()
			ip_info["scan_mac_address"] = query.scan_mac
			ip_info["scan_mac_product"] = query.scan_mac_product
			ip_info["ip_type"] = query.get_ip_type_display()
			ip_info["hostname"] = query.hostname
			ip_info["tcp_port_list"] = query.tcp_port_list
			ip_info["udp_port_list"] = query.udp_port_list
			ip_info["query_time"] = query.query_time
			scan_ips_info[query.ip] = ip_info

		ips = list(IP(network_info.network))
		if column_key == "ip":
			if order == 'descend':
				ips.sort(reverse=True)
			elif order == 'ascend':
				ips.sort(reverse=False)
		scan_ips = list(scan_ips_info.keys())

		result = []
		total_ips = len(ips)
		current_page = current_page -1
		for ip in ips[current_page*page_size : current_page*page_size+page_size]:
			ip = str(ip)
			scan_ip_infos = dict()
			if ip in scan_ips:
				scan_ip_infos["key"] = ip
				scan_ip_infos["ip"] = ip
				scan_ip_infos["network"] = scan_ips_info[ip]["network"]
				scan_ip_infos["ip_status"] = scan_ips_info[ip]["ip_status"]
				scan_ip_infos["scan_mac_address"] = scan_ips_info[ip]["scan_mac_address"]
				scan_ip_infos["scan_mac_product"] = scan_ips_info[ip]["scan_mac_product"]
				scan_ip_infos["ip_type"] = scan_ips_info[ip]["ip_type"]
				scan_ip_infos["hostname"] = scan_ips_info[ip]["hostname"]
				scan_ip_infos["tcp_port_list"] = scan_ips_info[ip]["tcp_port_list"].replace("'", '"')
				scan_ip_infos["udp_port_list"] = scan_ips_info[ip]["udp_port_list"].replace("'", '"')
				scan_ip_infos["query_time"] = scan_ips_info[ip]["query_time"]
			else:
				scan_ip_infos["key"] = ip
				scan_ip_infos["ip"] = ip
				scan_ip_infos["network"] = network_info.network
				scan_ip_infos["ip_status"] = "离线"
				scan_ip_infos["scan_mac_address"] = ""
				scan_ip_infos["scan_mac_product"] = ""
				scan_ip_infos["ip_type"] = "未使用"
				scan_ip_infos["hostname"] = ""
				scan_ip_infos["tcp_port_list"] = ""
				scan_ip_infos["udp_port_list"] = ""
				scan_ip_infos["query_time"] = network_info.query_time

			result.append(scan_ip_infos)
		data['result'] = result
		data['total_ips'] = total_ips
		data["status"] = "success"
		return HttpResponse(json.dumps(data, cls=json_encoder), content_type="application/json")


def get_tcp_ports_details(request, parameter):
	ip_details = NetworkQueryDetails.objects.filter(ip=parameter)
	tcp_port_info = json.loads(ip_details[0].tcp_port_list.replace("'", '"'))
	result = []
	for port_info in tcp_port_info:
		port_info_dict = dict()
		port_info = port_info.split(" ")
		port_info_dict["key"] = port_info[0]
		port_info_dict["ip"] = parameter
		port_info_dict["port"] = port_info[0]
		port_info_dict["status"] = port_info[1]
		port_info_dict["protocol"] = port_info[2]
		result.append(port_info_dict)
	data = dict()
	data['result'] = result
	data["status"] = "success"
	return HttpResponse(json.dumps(data, cls=json_encoder), content_type="application/json")


def get_udp_ports_details(request, parameter):
	ip_details = NetworkQueryDetails.objects.filter(ip=parameter)
	udp_port_info = json.loads(ip_details[0].udp_port_list.replace("'", '"'))
	result = []
	for port_info in udp_port_info:
		port_info_dict = dict()
		port_info = port_info.split(" ")
		port_info_dict["key"] = port_info[0]
		port_info_dict["ip"] = parameter
		port_info_dict["port"] = port_info[0]
		port_info_dict["status"] = port_info[1]
		port_info_dict["protocol"] = port_info[2]
		result.append(port_info_dict)
	data = dict()
	data['result'] = result
	data["status"] = "success"
	return HttpResponse(json.dumps(data, cls=json_encoder), content_type="application/json")


def get_network_query_crontab_task(request):
	"""获取网络探测所有定时任务"""
	data = dict()
	result = dict()
	parameter = request.GET.get("network").replace("$", "/")
	if parameter == "all":
		all_networks = NetworkQueryList.objects.all()
		for network in all_networks:
			if network.auto_enable:
				network_scan_info = "{0}&{1}&{2}".format(network.network, network.tcp_query_ports, network.udp_query_ports)
				result[network_scan_info] = network.crontab_task
	else:
		try:
			network = NetworkQueryList.objects.get(network=parameter)
			if network and network.auto_enable:
				network_scan_info = "{0}&{1}&{2}".format(network.network, network.tcp_query_ports, network.udp_query_ports)
				result[network_scan_info] = network.crontab_task
		except Exception as e:
			logging.error(e)
	data["status"] = "success"
	data['result'] = result
	return HttpResponse(json.dumps(data), content_type="application/json")




