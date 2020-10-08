from django.http import HttpResponse
import json
from libs.IPy import checkNetwork, IP
from libs.tool import json_encoder, ipv4_to_num, num_to_ipv4
from network_query.models import NetworkQueryList, NetworkQueryDetails
from django.core.paginator import Paginator
from networks_manage.models import Networks
from group_manage.models import NetworkGroup
from device_query.models import NetworkToDevice
from django.db.models.query import QuerySet
import base64
import os
import csv
import time, datetime
# Create your views here.


def build_network(request):
	data = dict()
	if request.method == "POST":
		post_data = json.loads(str(request.body, encoding='utf-8'))
		networks = post_data["networks"].strip()
		parent_group_name = post_data["parent_group_name"]

		unvalid_network = []
		networks = networks.split(" ")
		for network in networks:
			try:
				if not checkNetwork(network):
					unvalid_network.append("{0} 非法网络".format(network))
				elif Networks.objects.filter(network=network):
					unvalid_network.append("{0} 网络已存在".format(network))
				elif "/" not in network:
					unvalid_network.append("{0} 非法网络".format(network))
			except:
				unvalid_network.append("{0} 非法网络".format(network))
		if len(unvalid_network) == 0:
			network_group_info = NetworkGroup.objects.get(name=parent_group_name)
			network_group_networks = json.loads(network_group_info.networks)

			for network in networks:
				network_group_networks.append(network)
				Networks.objects.create(
					network=network,
					ip_total=IP(network).len(),
					query_time=datetime.datetime.now()
				)
			NetworkGroup.objects.filter(name=parent_group_name).update(networks=str(network_group_networks).replace("'", '"'))
			data["status"] = "success"
		else:
			data["status"] = "fail"
			data["data"] = unvalid_network
	if request.method == "DELETE":
		post_data = json.loads(str(request.body, encoding='utf-8'))
		networks = post_data.get("networks")
		for network in networks:
			network_group_info = NetworkGroup.objects.get(networks__icontains='"' + network + '"')
			network_group_networks = json.loads(network_group_info.networks)
			network_group_networks.remove(network)
			NetworkGroup.objects.filter(name=network_group_info.name).update(networks=str(network_group_networks).replace("'", '"'))
			Networks.objects.filter(network=network).delete()
		data["status"] = "success"

	return HttpResponse(json.dumps(data), content_type="application/json")


def get_all_networks(request):
	data = dict()
	result = []
	group = request.GET.get("group")
	if group:
		networks = []
		network_group_info = NetworkGroup.objects.get(name=group)
		networks_to_group = json.loads(network_group_info.networks)
		networks.extend(networks_to_group)
		if network_group_info.haschild:
			network_group_child_query = NetworkGroup.objects.filter(parent_array__icontains='"' + group + '"')
			for child_group in network_group_child_query:
				networks.extend(json.loads(child_group.networks))
	else:
		networks = Networks.objects.all()

	for network in networks:
		network_info = dict()
		if isinstance(networks, QuerySet):
			total_ips = network.ip_total
			network = network.network
		else:
			network_queryset = Networks.objects.get(network=network)
			network = network_queryset.network
			total_ips = network_queryset.ip_total

		network_info['key'] = network
		network_info['network'] = network
		network_info['total_ips'] = total_ips
		print(network)
		group_name_info = NetworkGroup.objects.get(networks__icontains='"'+network+'"')
		group_name_parent_array = json.loads(group_name_info.parent_array)
		if group_name_parent_array:
			group_name = "/".join(group_name_parent_array) + "/" + group_name_info.name
		else:
			group_name = group_name_info.name

		network_info['group_name'] = group_name

		network_to_device_info = NetworkToDevice.objects.filter(network=network)
		if network_to_device_info:
			network_to_device_hostname = network_to_device_info[0].device_hostname
			network_to_device_ip = network_to_device_info[0].device_ip
			network_to_device_interface = network_to_device_info[0].interface
		else:
			network_to_device_ip = ''
			network_to_device_hostname = ''
			network_to_device_interface = ''

		network_info['device_ip'] = network_to_device_ip
		network_info['device_interface'] = network_to_device_interface
		network_info['device_name'] = network_to_device_hostname

		result.append(network_info)

	data["result"] = result
	data["status"] = "success"
	return HttpResponse(json.dumps(data), content_type="application/json")


def patch_import_networks(request):
	data = dict()
	if request.method == "POST":
		post_data = json.loads(str(request.body, encoding='utf-8'))
		csv_date = post_data.get('data')
		csv_date = csv_date.split(",")[-1]
		try:
			csv_date_decode = base64.urlsafe_b64decode(csv_date).decode('gbk')
		except UnicodeDecodeError:
			csv_date_decode = base64.urlsafe_b64decode(csv_date).decode('utf-8-sig')
		try:
			filename = "/tmp/malformedcsv"
			new_filename = "/tmp/malformedcsv_out"

			network_csv_header = ['网络地址', '分组名称']

			with open(filename, "w") as file:
				file.write(csv_date_decode)
				file.flush()
				os.popen("csv_format {0} {1}".format(filename, new_filename))
				count = 0
				while count < 10:
					if os.path.exists(new_filename):
						break
					time.sleep(0.2)
					count += 1

				tmp_file = open(new_filename, 'r', encoding='utf-8')
				reader = csv.DictReader(tmp_file)
				fieldnames = reader.fieldnames
				print("fieldnames:", fieldnames)
				if not (set(network_csv_header).issubset(fieldnames)):
					data["status"] = "fail"
					data["result"] = "导入字段名称有误，请检查！"
					return HttpResponse(json.dumps(data), content_type="application/json")

				unvalid_info = []
				network_to_group = dict()
				for i in reader:
					network = i[network_csv_header[0]]
					group_name = i[network_csv_header[1]].split("/")[0]
					try:
						if not checkNetwork(network):
							unvalid_info.append("{0} 非法网络".format(network))
							break
						elif Networks.objects.filter(network=network):
							unvalid_info.append("{0} 网络已存在".format(network))
							break
						elif "/" not in network:
							unvalid_info.append("{0} 非法网络".format(network))
							break
					except:
						unvalid_info.append("{0} 非法网络".format(network))
						break
					if not NetworkGroup.objects.filter(name=group_name):
						unvalid_info.append("{0} 未知分组名".format(group_name))
						break
					if group_name in network_to_group.keys():
						network_to_group[group_name].append(network)
					else:
						network_to_group[group_name] = [network]
				if unvalid_info:
					data["status"] = "fail"
					data["result"] = "，".join(unvalid_info) + "，请检查！"
					return HttpResponse(json.dumps(data), content_type="application/json")
				else:
					for group_name, networks in network_to_group.items():
						network_group_info = NetworkGroup.objects.get(name=group_name)
						network_group_networks = json.loads(network_group_info.networks)
						network_group_networks.extend(networks)

						insert_to_networks = []
						for network in networks:
							insert_to_networks.append(Networks(
								network=network,
								ip_total=IP(network).len(),
								query_time=datetime.datetime.now())
							)
						Networks.objects.bulk_create(insert_to_networks)
						NetworkGroup.objects.filter(name=group_name).update(networks=str(network_group_networks).replace("'", '"'))
			data["status"] = "success"
			return HttpResponse(json.dumps(data), content_type="application/json")
		except Exception as e:
			print(e)
			data["status"] = "fail"
			data["result"] = "未知错误，请检查！"
			return HttpResponse(json.dumps(data), content_type="application/json")
		finally:
			os.popen("rm -rf {0} {1}".format(filename, new_filename))


def patch_export_networks(request):
	post_data = json.loads(str(request.body, encoding='utf-8'))
	networks = post_data["networks"]
	data = dict()
	result = []
	if not networks:
		networks = Networks.objects.all()
	for network in networks:
		network_info = dict()
		if isinstance(networks, QuerySet):
			total_ips = network.ip_total
			network = network.network
		else:
			network_queryset = Networks.objects.get(network=network)
			network = network_queryset.network
			total_ips = network_queryset.ip_total

		network_info['key'] = network
		network_info['network'] = network
		network_info['total_ips'] = total_ips
		group_name_info = NetworkGroup.objects.get(networks__icontains='"'+network+'"')
		group_name_parent_array = json.loads(group_name_info.parent_array)
		if group_name_parent_array:
			group_name = "/".join(group_name_parent_array) + "/" + group_name_info.name
		else:
			group_name = group_name_info.name

		network_info['group_name'] = group_name

		network_to_device_info = NetworkToDevice.objects.filter(network=network)
		if network_to_device_info:
			network_to_device_hostname = json.loads(network_to_device_info[0].device_hostname)
			network_to_device_ip = json.loads(network_to_device_info[0].device_ip)
			network_to_device_interface = json.loads(network_to_device_info[0].interface)
		else:
			network_to_device_ip = []
			network_to_device_hostname = []
			network_to_device_interface = []

		network_info['device_ip'] = ','.join(network_to_device_ip)
		network_info['device_interface'] = ','.join(network_to_device_interface)
		network_info['device_name'] = ','.join(network_to_device_hostname)

		result.append(network_info)

	data["result"] = result
	data["status"] = "success"
	return HttpResponse(json.dumps(data), content_type="application/json")

#
# def get_network_ip_details(request):
# 	print(request.GET.get('id'))
# 	data = dict()
# 	data["status"] = "success"
# 	return HttpResponse(json.dumps(data), content_type="application/json")


def get_network_ip_details(request):
	data = dict()
	network = request.GET.get("id").replace("$", "/")
	print(network)
	network_info = NetworkQueryList.objects.get(network=network)
	print("network_info:", network_info)
	page_size = int(request.GET.get("page_size"))
	current_page = int(request.GET.get("current_page"))
	ip_status = request.GET.get("ip_status")
	ip_type = request.GET.get("ip_type")
	column_key = request.GET.get("columnKey")
	order = request.GET.get("order")

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



