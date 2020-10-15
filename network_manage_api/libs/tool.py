# -*- coding: utf-8 -*-
from django.conf import settings
from django.http.response import HttpResponse
from django.db.models import QuerySet
import random
import datetime
from decimal import Decimal
from datetime import datetime, date as datetime_date
import re
import json
try:
    session_exipry_time = settings.CUSTOM_SESSION_EXIPRY_TIME
except Exception:
    session_exipry_time = 60 * 30

# 生成随机字符串
def gen_rand_char(length=16, chars='0123456789zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA'):
    return ''.join(random.sample(chars, length))

# 转换时间格式到字符串
def human_datetime(date=None):
    if date:
        assert isinstance(date, datetime)
    else:
        date = datetime.now()
    return date.strftime('%Y-%m-%d %H:%M:%S')


# 继承自dict，实现可以通过.来操作元素
class AttrDict(dict):
    def __setattr__(self, key, value):
        self.__setitem__(key, value)

    def __getattr__(self, item):
        return self.__getitem__(item)

    def __delattr__(self, item):
        self.__delitem__(item)


def json_response(data='', error=''):
    content = AttrDict(data=data, error=error)
    if error:
        content.data = ''
    elif hasattr(data, 'to_dict'):
        content.data = data.to_dict()
    elif isinstance(data, (list, QuerySet)) and all([hasattr(item, 'to_dict') for item in data]):
        content.data = [item.to_dict() for item in data]
    return HttpResponse(json.dumps(content, cls=DateTimeEncoder), content_type='application/json')


# 转换时间戳到时间
def timestamp_to_human_date(timestamp):
    date_array = datetime.fromtimestamp(timestamp)
    return date_array.strftime("%Y-%m-%d %H:%M:%S")


# 日期json序列化
class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(o, datetime_date):
            return o.strftime('%Y-%m-%d')
        elif isinstance(o, Decimal):
            return float(o)

        return json.JSONEncoder.default(self, o)

def get_request_real_ip(headers: dict):
    x_real_ip = headers.get('x-forwarded-for')
    if not x_real_ip:
        x_real_ip = headers.get('x-real-ip', '')
    return x_real_ip.split(',')[0]


def num_to_ipv4(x):
    return '.'.join([str(int(x/(256**i)%256)) for i in range(3,-1,-1)])


def ipv4_to_num(x):
    return sum([256**j*int(i) for j,i in enumerate(x.split('.')[::-1])])


def check_ip(ip_addr):
    compile_ip = re.compile('^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$')
    if compile_ip.match(ip_addr):
        return True
    else:
        return False


class json_encoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        return json.JSONEncoder.default(obj)

