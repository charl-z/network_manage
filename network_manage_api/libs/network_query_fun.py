# -*- coding: utf-8 -*-
# @Time    : 2020/8/22 21:59
# @Author  : weidengyi
import nmap
import redis
import yaml
import threading
import datetime
from libs.utils import connect_postgresql_db, close_db_connection
from network_query.models import NetworkQueryDetails
from libs.utils import get_conf_handle

conf_data = get_conf_handle()
r = redis.Redis(host=conf_data['REDIS_CONF']['host'],
                port=conf_data['REDIS_CONF']['port'],
                password=conf_data['REDIS_CONF']['password'],
                decode_responses=True, db=1
                )


class NetworkQuery(object):
	def __init__(self):
		self.nm = nmap.PortScanner()
		self.conn_psql = connect_postgresql_db()
		self.cur_psql = self.conn_psql.cursor()


	def get_mac_manufacturer(self, mac):
		"""
		:param mac: 00:00:00:02:fe:3a
		:return: Apple, Inc.
		"""
		mac_pre = "-".join(mac.split(":")[:3])
		sql = "select manufacturer from mac_manufacturer where mac_pre='{0}';".format(mac_pre)
		self.cur_psql.execute(sql)

		manufacturer_info = self.cur_psql.fetchall()
		if not manufacturer_info:
			return ""
		return manufacturer_info[0][0]

	def exec_port_scan(self, ip, tcp_ports='', udp_ports='', network=''):
		scan_result = dict()
		if tcp_ports:
			ret = self.nm.scan(hosts=ip, arguments='-p {0} --script nbstat'.format(tcp_ports))
		else:
			ret = self.nm.scan(hosts=ip, arguments='--script nbstat -p 22')
		if ret['scan']:
			scan_info_dict = ret['scan'][ip]

			try:
				mac_address = scan_info_dict['addresses']['mac']
			except:
				mac_address = ''
			scan_result["ip"] = ip
			scan_result["scan_mac"] = mac_address

			if mac_address:
				scan_result["scan_mac_product"] = self.get_mac_manufacturer(mac_address)
			else:
				scan_result["scan_mac_product"] = ''

			tcp_port_list = []
			if scan_info_dict.get("tcp"):
				tcp_port_info = scan_info_dict['tcp']
				for info in tcp_port_info:
					state = tcp_port_info[info]['state']
					protocol = tcp_port_info[info]['name']
					if not protocol:
						protocol='unknown'
					tcp_port_list.append("{0} {1} {2}".format(info, state, protocol))
			if tcp_ports:
				scan_result["tcp_port_list"] = tcp_port_list
			else:
				scan_result["tcp_port_list"] = ''

			hostname = ''
			if scan_info_dict.get('hostscript'):
				hostname_infos = scan_info_dict.get('hostscript')
				hostname = hostname_infos[0]['output'].split(",")[0].split(" ", 2)[-1]
			scan_result["hostname"] = hostname

			udp_port_list = []
			if udp_ports:
				ret = self.nm.scan(hosts=ip, arguments='-sU -p {0}'.format(udp_ports))
				if ret['scan']:
					scan_info_dict = ret['scan'][ip]
					if scan_info_dict.get("udp"):
						udp_port_info = scan_info_dict['udp']
						for info in udp_port_info:
							state = udp_port_info[info]['state']
							if 'open' in state:
								state = 'open'
							protocol = udp_port_info[info]['name']
							if not protocol:
								protocol = 'unknown'
							udp_port_list.append("{0} {1} {2}".format(info, state, protocol))
				scan_result["udp_port_list"] = udp_port_list
			scan_result['network'] = network
			scan_result['ip_status'] = 1
			scan_result['ip_type'] = 0
			scan_result['query_time'] = datetime.datetime.now()
			NetworkQueryDetails.objects.create(**scan_result)

	def exec_redis_task(self, redis_network_info):
		# thread_list = []
		redis_network_info_list = redis_network_info.split("&")
		network = redis_network_info_list[0]
		tcp_scan_ports = redis_network_info_list[1]
		udp_scan_ports = redis_network_info_list[2]

		ips = r.llen(redis_network_info)
		while True:
			try:
				thread_list = []
				for i in range(ips):
					if r.llen(redis_network_info) != 0:
						ip = r.lpop(redis_network_info)
						t = threading.Thread(target=self.exec_port_scan, args=(ip, tcp_scan_ports, udp_scan_ports, network))
						thread_list.append(t)
					else:
						break
				for thread in thread_list:
					thread.start()
				for thread in thread_list:
					thread.join()

			except Exception as e:
				pass

			if r.llen(redis_network_info) == 0:
				sql = "select count(1) from network_query_result where network = '{0}'".format(network)
				self.cur_psql.execute(sql)
				online_ip_num = int(self.cur_psql.fetchall()[0][0])
				sql = "update network_query_task SET online_ip_num={0}, query_status=2 where network='{1}';".format(online_ip_num, network)
				self.cur_psql.execute(sql)
				self.conn_psql.commit()
				break



if __name__ == "__main__":
	networks = "10.2.0.0/24"
	network_query = NetworkQuery()
	print(network_query.get_mac_manufacturer("00:00:00:02:73:04"))

	network_info = "10.2.0.0/24&&53,67,546"
	# network_info = network_info.split()
	# network_query.exec_port_scan("10.2.0.51")

