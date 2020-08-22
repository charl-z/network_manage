from django.conf import settings
import random
import datetime
import re
try:
    session_exipry_time = settings.CUSTOM_SESSION_EXIPRY_TIME
except Exception:
    session_exipry_time = 60 * 30

# 生成随机字符串
def gen_rand_char(length=16, chars='0123456789zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA'):
    return ''.join(random.sample(chars, length))


# 转换时间戳到时间
def timestamp_to_human_date(timestamp):
    date_array = datetime.fromtimestamp(timestamp)
    return date_array.strftime("%Y-%m-%d %H:%M:%S")


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
