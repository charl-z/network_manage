# -*- coding: utf-8 -*-
# @Time    : 2020/8/27 18:42
# @Author  : weidengyi

import psycopg2
import yaml


conf = open(r'/opt/network_manage/conf/config.yml')
conf_data = yaml.load(conf, Loader=yaml.FullLoader)


def connect_postgresql_db():
	try:
		conn = psycopg2.connect(
								database=conf_data['PostgreSQL']['database'],
								user=conf_data['PostgreSQL']['username'],
								# password='xuhang',
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


def create_mac_manufacturer_table(conn):
	create_mac_manufacturer_table = "CREATE TABLE IF NOT EXISTS mac_manufacturer(mac_pre VARCHAR(10), manufacturer TEXT)"
	create_mac_manufacturer_index = "CREATE INDEX IF NOT EXISTS mac_manufacturer_index ON mac_manufacturer USING btree (mac_pre)"

	cur = conn.cursor()
	cur.execute(create_mac_manufacturer_table)
	cur.execute(create_mac_manufacturer_index)


def insert_mac_manufacturer_to_table(conn):
	cur = conn.cursor()
	sql = "INSERT INTO mac_manufacturer(mac_pre, manufacturer) VALUES "
	with open(conf_data["MAC_OUI_PATH"], "r", encoding='UTF-8') as file:
		contents = file.readlines()
		for mac in contents:
			if "(hex)" in mac:
				mac = mac.split("(hex)")
				mac_pre = mac[0].strip()
				company = mac[1].strip().replace("'", "''")
				sql += "('{0}','{1}'),".format(mac_pre, company)
		sql = sql[:-1]
		sql += ";"
		cur.execute(sql)



if __name__ == "__main__":
	conn = connect_postgresql_db()
	create_mac_manufacturer_table(conn)
	insert_mac_manufacturer_to_table(conn)
	close_db_connection(conn)