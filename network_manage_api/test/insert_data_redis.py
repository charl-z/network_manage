# -*- coding: utf-8 -*-
# @Time    : 2020/5/21 22:01
# @Author  : charl-z


import requests
import redis, yaml

conf = open(r'../conf/config.yml')
conf_data = yaml.load(conf, Loader=yaml.FullLoader)
r = redis.Redis(host='47.96.156.191', port=4580,  password='251493584wdy', decode_responses=True, db=1)




num_to_ipv4 = lambda x: '.'.join([str(int(x/(256**i)%256)) for i in range(3,-1,-1)])

for i in range(900000000, 900001000):
	r.rpush(conf_data['DEVICE_QUERY_QUEUE'], "{0} {1} {2}".format(num_to_ipv4(i), 161, "public"))

