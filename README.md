# 网络资产管理
### Python安装

```
wget https://www.python.org/ftp/python/3.6.11/Python-3.6.11.tgz
tar -xf Python-3.6.11.tgz
cd Python-3.6.11
./configure --prefix=/usr/local/python36
make && make install
ln -s /usr/local/python36/bin/python3 /usr/bin/python3
ln -s /usr/local/python36/bin/pip3 /usr/bin/pip3
```

### Python虚拟环境安装

- 安装virtualenv virtualenvwrapper

```
pip3 install virtualenv virtualenvwrapper
ln -s /usr/local/python36/bin/virtualenvwrapper.sh /usr/bin/virtualenvwrapper.sh
ln -s /usr/local/python36/bin/virtualenv /usr/bin/virtualenv
```

- 在~/.bashrc中添加行：

```
export WORKON_HOME=$HOME/.virtualenvs
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
source /usr/bin/virtualenvwrapper.sh
```

- 创建指定版本的虚拟环境

```
mkvirtualenv -p /usr/bin/python3 network_manage
```

- **退出虚拟环境**

```
deactivate
```

- **删除虚拟环境**

```
rmvirtualenv network_manage
```

### Postgres数据库初始化

```
# 新建数据库文件
mkdir /usr/local/network_manage/
# 修改文件所属组
chown postgres:postgres /usr/local/network_manage/
# 初始化数据库文件
su - postgres -c "initdb -D /usr/local/network_manage/"
```

基于网络探测和交换机探测网络，管理IP资产

### 环境部署

- Python 3.6+
- Django 2.2
- React 16.11

#### 后台环境部署

1. 安装基础依赖包，进入network_manage_api执行：

```
pip install -r requirements.txt 
```

2. Django数据库配置：

```

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'device_query',
        'USER': 'root',
        'PASSWORD': '*****',
        'HOST': '127.0.0.1',
        'OPTIONS': {
            "init_command": "SET foreign_key_checks = 0;",
        },
    }
}
```

**注意需要在数据库先新建数据库:`create database device_query`**

3. 环境配置：

```python
# redis对应得配置文件
REDIS_CONF:
  host: 127.0.0.1
  password: 123456789
  port: 4580
# redis里面缓存设备探测信息得队列
DEVICE_QUERY_QUEUE: "device:query:queue"
# redis里面缓存设备探测定时任务的哈希
DEVICE_QUETY_CRONTAB_HASH: "device:crontab:task:time"

# 服务安装路径
SERVICE_INSTALL_PATH: "/opt/network_manage/"

# 脚本安装目录
SCRIPT_PATH:
  DEVICE_QUERY_CRON_PATH: "/opt/network_manage/bin/device_query_cron.py"

# 日志配置
LOG_SETUP:
  LOG_FORMAT: "%(asctime)s %(name)s %(levelname)s %(filename)s %(message)s"
  DATE_FORMAT: "%Y-%m-%d  %H:%M:%S"
  SERVICE_MONITOR_PATH: "/opt/network_manage/log/serviceMonitor.log"
```

4. 启动Django服务：

```
python manage.py makemigrations 
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

5. 在定时任务中开启服务监控

```
*/1 * * * * /opt/network_manage/bin/service_monitor.sh >>/dev/null 2>&1
```

#### 前台环境部署

1. 安装npm环境，自行百度安装
2. npm一键安装package.json里的所有依赖文件

```
npm install
```

3. 启动npm服务

```
npm run start
```

### 实现功能

------

- **设备探测**：支持交换机包括华为、华三、锐捷、思科、迈普（待实现)、中兴（待实现），支持自定义配置探测任务
- **终端远程登陆**：支持ssh和telnet两种方式
- **网络探测**：待实现

- **网络管理**：待实现
- **MAC管理**：待实现

### 主要功能实现展示



