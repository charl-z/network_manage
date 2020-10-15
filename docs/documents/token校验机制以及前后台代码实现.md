## token校验以及前后台代码实现

### token定义

Token是服务端生成的一串字符串，以作客户端进行请求的一个令牌，当第一次登录后，服务器生成一个Token便将此Token返回给客户端，以后客户端只需带上这个Token前来请求数据即可，无需再次带上用户名和密码。

　　**基于 Token 的身份验证**

1. 使用基于 Token 的身份验证方法，在服务端不需要存储用户的登录记录。流程是这样的：
2. 客户端使用用户名跟密码请求登录
3. 服务端收到请求，去验证用户名与密码
4. 验证成功后，服务端会签发一个 Token，再把这个 Token 发送给客户端
5. 客户端收到 Token 以后可以把它存储起来，比如放在 Cookie 里或者 Local Storage 里
6. 客户端每次向服务端请求资源的时候需要带着服务端签发的 Token
7. 服务端收到请求，然后去验证客户端请求里面带着的 Token，如果验证成功，就向客户端返回请求的数据
8. APP登录的时候发送加密的用户名和密码到服务器，服务器验证用户名和密码，如果成功，以某种方式比如随机生成32位的字符串作为token，存储到服务器中，并返回token到APP，以后APP请求时，
9. 凡是需要验证的地方都要带上该token，然后服务器端验证token，成功返回所需要的结果，失败返回错误信息，让他重新登录。其中服务器上token设置一个有效期，每次APP请求的时候都验证token和有效期。

### 实现思路

![token实现机制](D:\workspace\network_manage\docs\image\token实现机制.png)

### 前台代码实现逻辑

```js
import React from 'react';
import {Form, Input, Icon, Button, Tabs, Modal} from 'antd';
import styles from './login.module.css';
import history from 'libs/history';
import {http, updatePermissions} from 'libs';
import logo from './logo-spug-txt.png';

class LoginIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loginType: 'default'
    }
  }


  handleSubmit = (value) => {
    this.setState({loading: true});
    http.post('/api/account/login/', value)
    .then(data => {
      if (!data['has_real_ip']){
        Modal.warning({
          title: '安全警告',
          className: styles.tips,
          content: <div>
            未能获取到客户端的真实IP，无法提供基于请求来源IP的合法性验证，请注意！
          </div>,
          onOk: () => this.doLogin(data)
           })
        }else{
            this.doLogin(data)
        }
      }
      
    )
    .catch(function (error) {
      console.log(error);
    })
    this.setState({loading: false});
    };

  doLogin = (data) => {
    localStorage.setItem('token', data['access_token']);
    localStorage.setItem('is_supper', data['is_supper']);
    localStorage.setItem('permissions', JSON.stringify(data['permissions']));
    localStorage.setItem('host_perms', JSON.stringify(data['host_perms']));
    updatePermissions(data['is_supper'], data['host_perms'], data['permissions']);
    if (history.location.state && history.location.state['from']) {
      history.push(history.location.state['from'])
    } else {
      history.push('/welcome/index')
    }
  };

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <div><img className={styles.logo} src={logo} alt="logo"/></div>
          <div className={styles.desc}>网络设备管理运维平台</div>
        </div>
        <div className={styles.formContainer}>
          <Form onFinish={this.handleSubmit} >
            <Form.Item className={styles.formItem} name="username">
              <Input
                size="large"
                autoComplete="off"
                placeholder="请输入账户"
                prefix={<Icon type="user" className={styles.icon}/>}/>
            </Form.Item>
            <Form.Item className={styles.formItem} name="password">
              <Input
                size="large"
                type="password"
                autoComplete="off"
                placeholder="请输入密码"
                onPressEnter={this.handleSubmit}
                prefix={<Icon type="lock" className={styles.icon}/>}/>
            </Form.Item>
            <Form.Item className={styles.button}>
              <Button
                block
                size="large"
                type="primary"
                htmlType="submit"
                loading={this.state.loading}
                // onClick={this.handleSubmit}
                >
                  登录
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className={styles.footerZone}>
          <div className={styles.linksZone}>
            <a className={styles.links} title="官网" href="http://www.wadedy.cn"  target="_blank"
               rel="noopener noreferrer">官网</a>
            <a className={styles.links} title="Github" href="https://github.com/charl-z/network_manage/"  target="_blank"
               rel="noopener noreferrer"><Icon type="github" /></a>
            <a title="文档" href="https://github.com/charl-z/network_manage/"  target="_blank"
               rel="noopener noreferrer">文档</a>
          </div>
          <div style={{color: 'rgba(0, 0, 0, .45)'}}>Copyright <Icon type="copyright" /> 2020 By Charl-z</div>
        </div>
      </div>
    )
  }
}

export default LoginIndex

//请求拦截分析
import http from 'axios'
import history from './history'
import {message} from 'antd';

// response处理
function handleResponse(response) {
  let result;
  if (response.status === 401) {
    result = '会话过期，请重新登录';
    if (history.location.pathname !== '/') {
      history.push('/', {from: history.location})
    } else {
      return Promise.reject()
    }
  } else if (response.status === 200) {
    if (response.data.error) {
      result = response.data.error
    } else if (response.hasOwnProperty('data')) {
      return Promise.resolve(response.data.data)
    } else if (response.headers['content-type'] === 'application/octet-stream') {
      return Promise.resolve(response)
    } else {
      result = '无效的数据格式'
    }
  } else {
    result = `请求失败: ${response.status} ${response.statusText}`
  }

  message.error(result);
  return Promise.reject(result)
}

// 请求拦截器
http.interceptors.request.use(request => {
  if (request.url.startsWith('/api/')) {
    request.headers['X-Token'] = localStorage.getItem('token')
  }
  request.timeout = request.timeout || 300000;
  return request;
});

// 返回拦截器
http.interceptors.response.use(response => {
  return handleResponse(response)
}, error => {
  if (error.response) {
    return handleResponse(error.response)
  }
  const result = '请求异常: ' + error.message;
  message.error(result);
  return Promise.reject(result)
});

export default http;

```

**代码分析**

1. 用户通过用户名和密码登陆时候，通过`http.post('/api/account/login/', value)`的请求，将token的值，传给前台，保存在`localStorage`里面（`localStorage.setItem('token', data['access_token']);`）

2. 每次api请求之前，将token的封装在请求头里面

   ```
   // 请求拦截器
   http.interceptors.request.use(request => {
     if (request.url.startsWith('/api/')) {
       request.headers['X-Token'] = localStorage.getItem('token')
     }
     request.timeout = request.timeout || 300000;
     return request;
   });
   ```

3. 如果token过期或校验失败，让用户重新登陆

```js
if (response.status === 401) {
    // 如果返回的是401的错误码，说明token过期或校验失败，让用户重新登陆
    result = '会话过期，请重新登录';
    if (history.location.pathname !== '/') {
      history.push('/', {from: history.location})
    } else {
      return Promise.reject()
    }
```

### 后台代码实现

```python
# 用户表字段
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from libs.tool import human_datetime
from libs.mixins import ModelMixin
import json

# Create your models here.


class User(models.Model, ModelMixin):
    username = models.CharField(max_length=100)
    # nickname = models.CharField(max_length=100)
    password_hash = models.CharField(max_length=100)  # hashed password
    type = models.CharField(max_length=20, default='default')
    is_supper = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    access_token = models.CharField(max_length=32)
    token_expired = models.IntegerField(null=True)
    last_login = models.CharField(max_length=20)
    last_ip = models.CharField(max_length=50)

    created_at = models.CharField(max_length=20, default=human_datetime)
    deleted_at = models.CharField(max_length=20, null=True)

    @staticmethod
    def make_password(plain_password: str) -> str:
        return make_password(plain_password, hasher='pbkdf2_sha256')

    def verify_password(self, plain_password: str) -> bool:
        return check_password(plain_password, self.password_hash)

    def has_host_perm(self, host_id):
        if isinstance(host_id, (list, set, tuple)):
            return self.is_supper or set(host_id).issubset(set(self.host_perms))
        return self.is_supper or int(host_id) in self.host_perms

    def has_perms(self, codes):
        # return self.is_supper or self.role in codes
        return self.is_supper

    def __repr__(self):
        return '<User %r>' % self.username

    class Meta:
        db_table = 'users'
        ordering = ('-id',)
# 登陆逻辑
def login(request):
    form, error = JsonParser(
        Argument('username', help='请输入用户名'),
        Argument('password', help='请输入密码'),
    ).parse(request.body)
    if error is None:
        x_real_ip = request.META.get('REMOTE_ADDR', '')
        user = User.objects.filter(username=form.username).first()
        if user and not user.is_active:
            return json_response(error="账户已被系统禁用")
        else:
            if user:
                if user.verify_password(form.password):
                    return handle_user_info(user, x_real_ip)

        value = cache.get_or_set(form.username, 0, 86400)
        if value >= 3:
            if user and user.is_active:
                user.is_active = False
                user.save()
            return json_response(error='账户已被系统禁用')
        cache.set(form.username, value + 1, 86400)
        return json_response(error="用户名或密码错误，连续多次错误账户将会被禁用")
    return json_response(error=error)


def handle_user_info(user, x_real_ip):
    cache.delete(user.username)
    token_isvalid = user.access_token and len(user.access_token) == 32 and user.token_expired >= time.time()
    user.access_token = user.access_token if token_isvalid else uuid.uuid4().hex
    user.token_expired = time.time() + settings.LOGIN_EXIPRY_TIME
    user.last_login = human_datetime()
    user.last_ip = x_real_ip
    user.save()
    return json_response({
        'access_token': user.access_token,
        'is_supper': user.is_supper,
        'has_real_ip': True if x_real_ip else False,
        'host_perms': [] if user.is_supper else user.host_perms,
        'permissions': [] if user.is_supper else user.page_perms
    })

#中间件实现逻辑，即每次请求，先去判断该请求
class AuthenticationMiddleware(MiddlewareMixin):
    """
    登录验证
    """
    def process_request(self, request):
        if request.path in settings.AUTHENTICATION_EXCLUDES:
            return None
        if any(x.match(request.path) for x in settings.AUTHENTICATION_EXCLUDES if hasattr(x, 'match')):
            return None
        access_token = request.META.get('HTTP_X_TOKEN') or request.GET.get('x-token')
        if access_token and len(access_token) == 32:
            x_real_ip = request.META.get('REMOTE_ADDR', '')
            user = User.objects.filter(access_token=access_token).first()
            if user and x_real_ip == user.last_ip and user.token_expired >= time.time() and user.is_active:
                request.user = user
                if request.path != '/notify/':
                    user.token_expired = time.time() + settings.LOGIN_EXIPRY_TIME
                user.save()
                return None
        response = json_response(error="验证失败，请重新登录")
        response.status_code = 401
        return response
```

**代码分析**

1. 数据库字段`access_token = models.CharField(max_length=32)`保存的token值，`token_expired = models.IntegerField(null=True)`保存token过期时间
2. 用户名和密码登陆时候验证

```python
if user.verify_password(form.password):
    return handle_user_info(user, x_real_ip)
# 在用户名和密码校验成功后，在去配置token的值
token_isvalid = user.access_token and len(user.access_token) == 32 and user.token_expired >= time.time()
# user.access_token 判断当前的用户是否存在token，如果存在，在判断token是否合法，如果合法，在比较当前token是否以及过期
user.access_token = user.access_token if token_isvalid else uuid.uuid4().hex
# 如果access_token，就不处理，如果是校验失败，就重新生成，这里是通过uuid生成随机32位码
user.token_expired = time.time() + settings.LOGIN_EXIPRY_TIME
# 设置token的过期时间
user.save()
# 保存到数据库
return json_response({
    'access_token': user.access_token,
    'is_supper': user.is_supper,
    'has_real_ip': True if x_real_ip else False,
    'host_perms': [] if user.is_supper else user.host_perms,
    'permissions': [] if user.is_supper else user.page_perms
})
# 'access_token': user.access_token, token的值返回给前端保存
```

3. 通过django中间件，对每个api请求，先进行分析，校验token是否合法

```python
access_token = request.META.get('HTTP_X_TOKEN') or request.GET.get('x-token')
# 从请求头中获取token值
if access_token and len(access_token) == 32:
    # 校验token
    x_real_ip = request.META.get('REMOTE_ADDR', '')
    user = User.objects.filter(access_token=access_token).first()
    # 从数据库中获取token的值
    if user and x_real_ip == user.last_ip and user.token_expired >= time.time() and user.is_active:
    # 先判断通过token是否能够找到对应的用户user，如果存在，在判断，请求的IP是否与最后一次请求的一致（如果允许多台设备同时登陆，这里可以省略），然后再判断token是否过期
        request.user = user
        if request.path != '/notify/':
            user.token_expired = time.time() + settings.LOGIN_EXIPRY_TIME
            user.save()
            return None
     response = json_response(error="验证失败，请重新登录") 
     response.status_code = 401 # 如果校验失败，就给前台返回401的错误，让用户重新登陆
     return response
```

****

[详细代码](https://github.com/charl-z/network_manage)





