# -*- coding: utf-8 -*-

import base64

test = "DHCP使用率"
test = test.encode()
print(test)
test_encode = base64.b64encode(test)
print(test_encode)

test_decode = base64.urlsafe_b64decode(test_encode)
#
print(test_decode)
print(test_decode.decode('utf-8'))