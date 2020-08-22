from django.http import HttpResponse
from django.core.paginator import Paginator
import json
from libs.IPy import checkNetwork
from network_query.models import NetworkDevice
import datetime
# Create your views here.


def get_network_query_info(request):
	data = dict()
	data['status'] = "success"
	page_size = request.GET.get("page_size")
	current_page = request.GET.get("current_page")

	search_network = request.GET.get("search_network")

	if search_network:
		all_networks = NetworkDevice.objects.filter(network__contains=search_network)
	else:
		all_networks = NetworkDevice.objects.all()

	result = []
	paginator = Paginator(all_networks, page_size)
	total_networks = all_networks.count()
	network_page = paginator.page(current_page)
	for network in network_page:
		network_info = dict()
		network_info['key'] = network.id
		network_info['network'] = network.network
		network_info['query_ports'] = network.query_ports
		network_info['query_status'] = network.get_query_status_display()
		network_info['online_ip_num'] = network.online_ip_num
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
		print("---------:", post_data)
		networks = post_data["networks"].strip()
		query_ports = post_data["query_ports"].strip()
		crontab_task = post_data["crontab_task"]
		unvalid_network = []
		data = dict()

		# 探测端口校验
		if query_ports:
			try:
				query_ports_list = query_ports.split(",")
				for port in query_ports_list:
					if "-" in port:
						port = port.split("-")
						small, large = int(port[0]), int(port[1])
						if small > large:
							unvalid_network.append("非法扫描端口")
					else:
						int(port)
			except:
				unvalid_network.append("非法扫描端口")

		auto_enable = False
		if crontab_task == "on":
			auto_enable = True
		networks = networks.split(" ")
		for network in networks:
			try:
				if not checkNetwork(network):
					unvalid_network.append("{0} 非法网络".format(network))
				elif NetworkDevice.objects.filter(network=network):
					unvalid_network.append("{0} 网络已存在".format(network))
				elif "/" not in network:
					unvalid_network.append("{0} 非法网络".format(network))
			except:
				unvalid_network.append("{0} 非法网络".format(network))
		if len(unvalid_network) == 0:
			for network in networks:
				NetworkDevice.objects.create(
					network=network,
					query_ports=query_ports,
					auto_enable=auto_enable,
					# crontab_time=crontab_task.replace("'", '"')
				)
			data["status"] = "success"

		else:
			data["status"] = "fail"
			data["data"] = unvalid_network

		return HttpResponse(json.dumps(data), content_type="application/json")

def del_network_query(request):
	"""
	批量删除网络探测任务
	"""
	if request.method == "POST":
		post_data = json.loads(str(request.body, encoding='utf-8'))
		data = dict()
		delete_ids = post_data["ids"]
		print("delete_ids:", delete_ids)

		if(isinstance(delete_ids, int)):
			delete_ids = [delete_ids]

		for id in delete_ids:
			# TODO 删除snmpqueryresult表中探测数据数据

			# Todo 删除网络探测任务时候，需要将redis哈希表中的定时任务同步删除


		    NetworkDevice.objects.filter(id=id).delete()
		data["status"] = "success"
		return HttpResponse(json.dumps(data), content_type="application/json")