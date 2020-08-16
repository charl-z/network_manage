# -*- coding: utf-8 -*-
# @Time    : 2020/3/31 16:36
# @Author  : weidengyi


def get_list_avg(input_list):
	if input_list:
		total = 0
		for i in input_list:
			total += int(i)
		return int(total/len(input_list))
	else:
		return 0


def num_to_ipv4(x):
	return '.'.join([str(int(x/(256**i)%256)) for i in range(3,-1,-1)])


def ipv4_to_num(x):
	return sum([256**j*int(i) for j,i in enumerate(x.split('.')[::-1])])


if __name__ == "__main__":
	print(ipv4_to_num("10.1.101.4"))
