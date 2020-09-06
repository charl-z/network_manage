# -*- coding: utf-8 -*-
# @Time    : 2020/4/24 20:34
# @Author  : charl-z
import subprocess
import logging

logger = logging.getLogger('django')

ENTERPRISES_CODE = {
	2: "IBM",
	9: "ciscoSystems",
	2011: "HUAWEI",
	3902: "zhongxing",
	25506: "H3C",
	4881: "ruijie",
	5651: "maipu",
	2636: "juniper",
	31648: "dipu"
}

IP_ROUTE_TABLE_TYPE = {
	"1": "other",
	"2": "invalid",
	"3": "direct",
	"4": "indirect"
}


class deviceQuery():
	def __init__(self, community, ip, port=161):
		self.community = community
		self.ip = ip
		self.port = port
		self.enterprise_code = self.get_device_manufacturer_info()
		self.device_name = self.get_device_name()
		self.index_to_port = self.get_if_name()

	def get_device_manufacturer_info(self):
		"""获取设备得系统id"""
		oid = "1.3.6.1.2.1.1.2"
		result = self.snmkwalkv3(oid)
		result = result[0].split("=")[1]
		try:
			return ENTERPRISES_CODE[int(result.split(".", 2)[1])]
		except Exception as e:
			logging.info(e)
			return u"未知厂商"

	def get_device_name(self):
		"""获取设备名称"""
		oid = "1.3.6.1.2.1.1.5"
		result = self.snmkwalkv3(oid)
		result = result[0].split("=")[1]
		return result.split(" ")[-1].strip()

	def get_if_index(self):
		"""获取设备端口对应的索引"""
		oid = "1.3.6.1.2.1.2.2.1.1"
		indexs = []
		results = self.snmkwalkv3(oid)
		# print(results)
		for result in results:
			indexs.append(result.split(" ", 3)[-1])
		return indexs

	def get_if_name(self):
		"""获取设备端口对应的名称"""
		oid = "1.3.6.1.2.1.2.2.1.2"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			index = result[0].split(".")[-1].strip()
			port_descr = result[1].split(" ", 2)[-1].strip()
			info[index] = port_descr
		return info

	def get_if_speed(self):
		"""获取设备端口对应的速率"""
		oid = "1.3.6.1.2.1.2.2.1.5"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			index = result[0].split(".")[-1].strip()
			speed = result[1].split(" ")[-1].strip()
			info[index] = speed
		return info

	def get_if_oper_status(self):
		"""获取设备端口对应的状态"""
		oid = "1.3.6.1.2.1.2.2.1.8"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			index = result[0].split(".")[-1].strip()
			status = result[1].split(" ")[-1].strip()
			info[index] = status
		return info

	def get_if_descr(self):
		"""获取设备端口对应的描述信息(ifAlias)"""
		oid = "1.3.6.1.2.1.31.1.1.1.18"
		command = "snmpwalk -v1 -Cc -c{0} {1}:{2} {3} > /tmp/ifdescr".format(self.community, self.ip, self.port, oid)
		subprocess.getoutput(command)
		with open('/tmp/ifdescr', 'rb') as file:
			results = file.readlines()
		info = {}
		for result in results:
			try:
				result = bytes.decode(result).split("=")
				index = result[0].split(".")[-1].strip()
				descrs = result[1].strip()
				descrs = descrs.split(" ", 1)
				if len(descrs) != 1:
					name = descrs[1]
				else:
					name = ""
			except:
				info[index] = ""
			info[index] = name
		return info

	def get_brige_phy_port_to_macs(self):
		"""获取二层的所有mac地址对应的物理端口索引"""
		oid = "1.3.6.1.2.1.17.4.3.1.2"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			phy_index = result[1].split(" ")[-1].strip()
			mac = result[0].split(".")[-6:]
			mac = list(map(lambda x: "{0:0>2}".format(hex(int(x))[2:]).upper(), mac))
			mac = ":".join(mac)
			if phy_index not in info.keys():
				info[phy_index] = [mac]
			else:
				info[phy_index].append(mac)
		return info

	def get_phy_port_to_index(self):
		"""获取物理端口索引对应的ifindex的索引关系"""
		oid = "1.3.6.1.2.1.17.1.4.1.2"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			phy_index = result[0].split(".")[-1].strip()
			index = result[1].split(" ")[-1].strip()
			info[phy_index] = index
		return info

	def get_index_to_macs(self):
		"""将索引和二层得mac地址进行对应"""
		try:
			brige_phy_port_to_macs = self.get_brige_phy_port_to_macs()
			phy_port_to_index = self.get_phy_port_to_index()
			print(brige_phy_port_to_macs.keys(), phy_port_to_index)

			index_to_macs = {}
			for phy_index in brige_phy_port_to_macs.keys():
				print(phy_port_to_index[phy_index])
				index_to_macs[phy_port_to_index[phy_index]] = brige_phy_port_to_macs[phy_index]
		except Exception as e:
			logging.error(e)
		return index_to_macs

	def get_if_index_to_ip(self):
		"""获取ip地址对应所在的设备接口索引"""
		""":return 数据{'43':"12.12.12.12"}"""
		oid = "1.3.6.1.2.1.4.20.1.2"
		info = {}
		results = self.snmkwalkv3(oid)
		# print(results)
		for result in results:
			result = result.split("=")
			address = ".".join(result[0].split(".")[-4:]).strip()
			index = result[1].split(" ")[-1].strip()
			info[index] = address
		return info

	def get_if_index_to_mac(self):
		"""获取设备端口对应的mac地址"""
		oid = "1.3.6.1.2.1.2.2.1.6"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			index = result[0].split(".")[-1].strip()
			mac = result[1].split(" ")[-1].strip()
			info[index] = mac
		return info

	def get_if_address_to_mac(self):
		"""获取设备端口IP地址信息对应的mac(ARP表)"""
		oid = "1.3.6.1.2.1.3.1.1.2"
		info = {}
		results = self.snmkwalkv3(oid)
		# print(results)
		for result in results:
			result = result.split("=")
			mac = result[1].split(" ", 2)[-1].strip()
			ip_address = ".".join(result[0].split(".")[-4:]).strip()
			info[ip_address.strip()] = mac.replace(" ", ":")
		return info

	def get_if_address_to_mask(self):
		"""获取设备端口配置ip地址对应的掩码"""
		oid = "1.3.6.1.2.1.4.20.1.3"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			ip_address = ".".join(result[0].split(".")[-4:]).strip()
			mask = result[1].split(" ", 2)[-1].strip()
			info[ip_address.strip()] = mask
		return info

	def get_arp_ip_address_to_index(self):
		"""arp表中ip地址与接口索引对应关系"""
		"""return 类型：{'32': ['10.1.101.1', '10.1.101.4', '10.1.101.37']}"""
		oid = "1.3.6.1.2.1.4.22.1.1"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			index = result[1].split(" ", 2)[-1].strip()
			ip_address = ".".join(result[0].split(".")[-4:]).strip()
			if index not in info.keys():
				info[index] = [ip_address]
			else:
				info[index].append(ip_address)
		return info

	def get_ip_route_table_dest_ip_to_index(self):
		"""获取设备路由表中的目的ip对应的索引"""
		oid = "1.3.6.1.2.1.4.21.1.2"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			address = ".".join(result[0].split(".")[-4:]).strip()
			index = result[1].split(" ")[-1].strip()
			info[address] = index
		return info

	def get_ip_route_table_dest_ip_to_mask(self):
		"""获取设备路由表中的目的ip对应的掩码"""
		oid = "1.3.6.1.2.1.4.21.1.11"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			address = ".".join(result[0].split(".")[-4:]).strip()
			mask = result[1].split(" ", 2)[-1].strip()
			info[address] = mask
		return info

	def get_ip_route_table_next_hop(self):
		"""获取设备路由表中的目的ip对应的下一跳地址"""
		oid = "1.3.6.1.2.1.4.21.1.7"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			address = ".".join(result[0].split(".")[-4:]).strip()
			next_hop = result[1].split(" ", 2)[-1].strip()
			info[address] = next_hop
		return info

	def get_ip_route_table_type(self):
		"""获取设备路由表中的目的ip对应的路由表类型"""
		oid = "1.3.6.1.2.1.4.21.1.8"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			address = ".".join(result[0].split(".")[-4:]).strip()
			type = result[1].split(" ", 2)[-1].strip()
			info[address] = type
		return info

	def get_neighbors_index_to_mac(self):
		"""获取邻居表中索引的对端端口MAC"""
		oid = "1.0.8802.1.1.2.1.4.1.1.5"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			index = ".".join(result[0].strip().split(".")[-2:])
			mac = ":".join(result[1].strip().split(" ")[1:])
			info[index] = mac
		return info

	def get_neighbors_index_to_port_name(self):
		"""获取邻居表中索引的对端端口名称"""
		oid = "1.0.8802.1.1.2.1.4.1.1.7"
		info = {}
		results = self.snmkwalkv3(oid)
		for result in results:
			result = result.split("=")
			index = ".".join(result[0].strip().split(".")[-2:])
			port_name = result[1].strip().split(" ")[1]
			info[index] = port_name
		return info

	def get_all_infos(self):
		indexs = self.get_if_index()
		if_names = self.index_to_port
		if_oper_status = self.get_if_oper_status()
		if_speed = self.get_if_speed()
		if_descrs = self.get_if_descr()

		if_index_to_mac = self.get_if_index_to_mac()
		index_to_address = self.get_if_index_to_ip()  # {'43':"12.12.12.12"}
		address_to_mask = self.get_if_address_to_mask()

		arp_index_to_address = self.get_arp_ip_address_to_index()  # {'43':['12.12.12.12', '12.12.12.13']}
		address_to_mac = self.get_if_address_to_mac()
		brige_index_to_mac = self.get_index_to_macs()
		info = []
		for index in indexs:
			try:
				content = {}
				content["index"] = index
				content["name"] = if_names[index]
				content["speed"] = if_speed[index]
				content["status"] = if_oper_status[index]
				content["if_descrs"] = if_descrs[index]

				if index in index_to_address.keys():
					#  ip_setup表示192.168.34.0/24 11:12:12:11:11:12
					address = index_to_address[index]
					if address == '127.0.0.1':
						mac = ""
						netmask = "255.0.0.0"
					# elif address not in address_to_mac.keys():
					# 	mac = ""
					else:
						netmask = address_to_mask[address]
						mac = if_index_to_mac[index]
					content["ip_setup"] = "{0}/{1} {2}".format(address, self.ip_to_mask(netmask), mac)
				else:
					content["ip_setup"] = ""

				if index in arp_index_to_address.keys():
					ip_to_macs = []
					for ip in arp_index_to_address[index]:
						ip_to_mac = "{0} {1}".format(ip, address_to_mac[ip])
						ip_to_macs.append(ip_to_mac)
					content["arp_infos"] = ip_to_macs
				else:
					content["arp_infos"] = ""

				if index in brige_index_to_mac.keys():
					content["brige_macs"] = brige_index_to_mac[index]
				else:
					content["brige_macs"] = ""
				info.append(content)
			except Exception as e:
				logging.error(e)
		return info

	def package_ip_route_table(self):
		"""主装ip路由表的信息"""
		info = []
		dest_ip_to_mask = self.get_ip_route_table_dest_ip_to_mask()
		dest_ip_to_next_hop = self.get_ip_route_table_next_hop()
		dest_ip_to_route_table_type = self.get_ip_route_table_type()
		dest_ip_to_index = self.get_ip_route_table_dest_ip_to_index()

		for key in dest_ip_to_mask.keys():
			route_table_info = dict()
			route_table_info["dest_ip"] = "{0}/{1}".format(key, self.ip_to_mask(dest_ip_to_mask[key]))
			route_table_info["next_hop"] = dest_ip_to_next_hop[key]
			route_table_info["route_table_type"] = dest_ip_to_route_table_type[key]
			route_table_info["port_index"] = dest_ip_to_index[key]
			# route_table_info["port_name"] = self.index_to_port[dest_ip_to_index[key]]
			info.append(route_table_info)
		return info

	def snmkwalkv3(self, oid):
		command = "snmpwalk -v1 -Cc -c{0} {1}:{2} {3}".format(self.community, self.ip, self.port, oid)
		value = subprocess.getoutput(command)
		return value.split("\n")

	def ip_to_mask(self, netmask):
		"""将IP地址表示的掩码转化成数字"""
		result = ''
		for num in netmask.split("."):
			temp = str(bin(int(num)))[2:]
			result = result + temp
		return len("".join(str(result).split('0')[0:1]))

if __name__ == "__main__":
	device_query1 = deviceQuery("public", "10.1.101.251", "161")
	print(device_query1.get_all_infos())

