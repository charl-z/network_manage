# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the AGPL-3.0 License.
from channels.generic.websocket import WebsocketConsumer
from django_redis import get_redis_connection
from django.http.request import QueryDict
# from apps.setting.utils import AppSetting
# from apps.account.models import User
from device_query.models import QueryDevice
from threading import Thread
from asgiref.sync import async_to_sync
import json
from libs.ssh import SSH
from libs.telnet import Telnet
from libs.tool import gen_rand_char
import time
import socket
from django.conf import settings
import telnetlib


try:
    terminal_exipry_time = settings.CUSTOM_TERMINAL_EXIPRY_TIME
except Exception:
    terminal_exipry_time = 60 * 30


class ExecConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.token = self.scope['url_route']['kwargs']['token']
        self.rds = get_redis_connection()

    def connect(self):
        self.accept()

    def disconnect(self, code):
        self.rds.close()

    def get_response(self):
        response = self.rds.brpop(self.token, timeout=5)
        return response[1] if response else None

    def receive(self, **kwargs):
        response = self.get_response()
        while response:
            data = response.decode()
            self.send(text_data=data)
            response = self.get_response()
        self.send(text_data='pong')


class SSHConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        kwargs = self.scope['url_route']['kwargs']
        # print("kwargs:", kwargs)
        # print("self.scope:", self.scope)
        # self.token = kwargs['token']
        self.ip = kwargs['id']
        self.chan = None
        self.ssh = None


    def loop_read(self):
        while True:
            data = self.chan.recv(32 * 1024)
            print('read: {!r}'.format(data))
            if not data:
                self.close(3333)
                break
            print("---------------data:", type(data))
            self.send(bytes_data=data)

    def receive(self, text_data=None, bytes_data=None):
        data = text_data or bytes_data
        if data:
            data = json.loads(data)
            print("receive:", data)
            resize = data.get('resize')
            if resize and len(resize) == 2:
                self.chan.resize_pty(*resize)
            else:
                print("send:", data['data'])
                self.chan.send(data['data'])

    def disconnect(self, code):
        self.chan.close()
        self.ssh.close()

    def connect(self):
        self.accept()
        self._init()

    def _init(self):
        self.send(bytes_data=b'Connecting ...\r\n')
        host = QueryDevice.objects.filter(snmp_host=self.ip).first()
        if not host:
            self.send(text_data='Unknown host\r\n')
            self.close()
        try:
            self.ssh = SSH(hostname=host.snmp_host, username=host.ssh_console_username,
                           password=host.ssh_console_password, port=host.ssh_console_port).get_client()
        except Exception as e:
            self.send(bytes_data=f'Exception: {e}\r\n'.encode())
            self.close()
        self.chan = self.ssh.invoke_shell(term='xterm')
        self.chan.transport.set_keepalive(30)
        Thread(target=self.loop_read).start()


class TelnetConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        kwargs = self.scope['url_route']['kwargs']
        self.host = kwargs['id']
        self._buffer = b''
        self.tn = None

    def connect(self):
        """
        打开 websocket 连接, 通过前端传入的参数尝试连接 telnet 主机
        """
        self.accept()

        self.tn = telnetlib.Telnet(host=self.host, port=23)
        command_result = self.tn.read_very_eager().decode('utf-8')
        data = bytes(command_result, encoding="utf8")
        self.send(bytes_data=data)

        Thread(target=self.websocket_to_django).start()

    def receive(self, text_data=None, bytes_data=None):
        data = text_data or bytes_data
        # print("receive data:", data)
        if data:
            data = json.loads(data)
            # print("receive:", data)
            resize = data.get('resize')
            if resize and len(resize) == 2:
               pass
            else:
                # print("send:", data['data'])
                self.tn.write(data['data'].encode('utf-8'))

    def django_to_telnet(self, data):
        self.tn.write(data.encode('utf-8'))

    def websocket_to_django(self):
        while 1:
            # expect 使用正则匹配所有返回内容，还可以实现超时无返回内容断开连接
            if len(self._buffer) >= 1:
                data = self._buffer[:4096]
                self._buffer = self._buffer[4096:]
            else:
                x, y, z = self.tn.expect([br'[\s\S]+'], timeout=terminal_exipry_time)
                # print(x, y, z)
                self._buffer += z
                print(self._buffer)
                data = self._buffer[:4096]  # 一次最多截取4096个字符
                self._buffer = self._buffer[4096:]

            if not len(data):
                raise socket.timeout
            self.send(bytes_data=data)

