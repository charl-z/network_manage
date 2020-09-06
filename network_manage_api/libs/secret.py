# -*- coding: utf-8 -*-
# @Time    : 2020/9/3 15:03
# @Author  : charl-z

import base64
from Crypto.Cipher import AES
from binascii import b2a_hex, a2b_hex

def pkcs7padding(text):
    """
    明文使用PKCS7填充
    最终调用AES加密方法时，传入的是一个byte数组，要求是16的整数倍，因此需要对明文进行处理
    :param text: 待加密内容(明文)
    :return:
    """
    bs = AES.block_size  # 16
    length = len(text)
    bytes_length = len(bytes(text, encoding='utf-8'))
    # tips：utf-8编码时，英文占1个byte，而中文占3个byte
    padding_size = length if(bytes_length == length) else bytes_length
    padding = bs - padding_size % bs
    # tips：chr(padding)看与其它语言的约定，有的会使用'\0'
    padding_text = chr(padding) * padding
    return text + padding_text


def pkcs7unpadding(text):
    """
    处理使用PKCS7填充过的数据
    :param text: 解密后的字符串
    :return:
    """
    try:
        length = len(text)
        unpadding = ord(text[length-1])
        return text[0:length-unpadding]
    except Exception as e:
        pass


def aes_encode(key, content):
    """
    AES加密
    key,iv使用同一个
    模式cbc
    填充pkcs7
    :param key: 密钥
    :param content: 加密内容
    :return:
    """
    key_bytes = bytes(key, encoding='utf-8')
    iv = key
    cipher = AES.new(key_bytes, AES.MODE_CBC, iv)
    # 处理明文
    content_padding = pkcs7padding(content)
    # 加密
    aes_encode_bytes = cipher.encrypt(bytes(content_padding, encoding='utf-8'))
    return b2a_hex(aes_encode_bytes) # 加密后的字符串转化为16进制


def aes_decode(key, content):
    """
    AES解密
     key,iv使用同一个
    模式cbc
    去填充pkcs7
    :param key:
    :param content:
    :return:
    """
    key_bytes = bytes(key, encoding='utf-8')
    iv = key
    cipher = AES.new(key_bytes, AES.MODE_CBC, iv)
    # 解密
    aes_decode_bytes = cipher.decrypt(a2b_hex(content))
    # 重新编码
    result = str(aes_decode_bytes, encoding='utf-8')
    # 去除填充内容
    result = pkcs7unpadding(result)
    return result

if __name__ == "__main__":
	key = "1234123412ABCDEF"
	myStr = "zdns@knet.cn"
	secret = aes_encode(key, myStr)
	print(secret)
	print(aes_decode(key, secret))