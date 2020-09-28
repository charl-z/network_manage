from django.http import HttpResponse
import json
from libs.IPy import checkNetwork, IP
from networks_manage.models import Networks
from group_manage.models import NetworkGroup
from device_query.models import NetworkToDivice
from django.db.models.query import QuerySet
import base64
import os
import csv
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
					ip_total=IP(network).len()
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
		group_name_info = NetworkGroup.objects.get(networks__icontains='"'+network+'"')
		group_name_parent_array = json.loads(group_name_info.parent_array)
		if group_name_parent_array:
			group_name = "/".join(group_name_parent_array) + "/" + group_name_info.name
		else:
			group_name = group_name_info.name

		network_info['group_name'] = group_name

		network_to_device_info = NetworkToDivice.objects.filter(network=network)
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
		print(csv_date)
		csv_date_decode = base64.urlsafe_b64decode(csv_date).decode('gbk')
		# print(csv_date_decode, type(csv_date_decode))
		filename = "/tmp/malformedcsv"
		new_filename = "/tmp/malformedcsv_out"

		network_csv_header = ["网络地址", "分组名称"]

		with open(filename, "w") as file:
			file.write(csv_date_decode)
			os.popen("csv_format {0} {1}".format(filename, new_filename))
			tmp_file = open(new_filename, 'r', encoding='utf-8')
			reader = csv.DictReader(tmp_file)
			for i in reader:
				print(i.keys(), i[network_csv_header[0]], i[network_csv_header[1]])

	data["status"] = "success"
	return HttpResponse(json.dumps(data), content_type="application/json")


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

		network_to_device_info = NetworkToDivice.objects.filter(network=network)
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
