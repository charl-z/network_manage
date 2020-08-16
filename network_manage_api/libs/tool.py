from django.conf import settings
import random
import datetime

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



