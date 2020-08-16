# -*- coding: utf-8 -*-
# @Time    : 2020/6/16 19:03
# @Author  : weidengyi

import os
import django
from channels.routing import get_default_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "network_manage.settings")
django.setup()
application = get_default_application()