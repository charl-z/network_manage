# -*- coding: utf-8 -*-
# @Time    : 2020/8/22 21:59
# @Author  : weidengyi
import nmap


class NetworkQuery(object):
	def __init__(self, networks, ports):
		self.network = networks
		self.ports = ports

