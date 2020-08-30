#!/bin/bash
source /etc/profile

base_path='/opt/network_manage/network_manage_api'
python_path='/root/.virtualenvs/network_manage/bin'

$python_path/python $base_path/bin/service_monitor.py >>/dev/null 2>&1

