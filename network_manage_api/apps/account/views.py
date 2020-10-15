from django.conf import settings
from django.core.cache import cache
from django.views.generic import View
from django.db.models import F
from libs.parser import JsonParser, Argument
from libs.tool import human_datetime, json_response
from account.models import User

import uuid
import json
import time
# Create your views here.


class UserView(View):
    def get(self, request):
        users = []
        for u in User.objects.filter(is_supper=False, deleted_by_id__isnull=True).annotate(role_name=F('role__name')):
            tmp = u.to_dict(excludes=('access_token', 'password_hash'))
            tmp['role_name'] = u.role_name
            users.append(tmp)
        return json_response(users)

    def post(self, request):
        form, error = JsonParser(
            Argument('username', help='请输入登录名'),
            Argument('password', help='请输入密码'),
        ).parse(request.body)
        if error is None:
            if User.objects.filter(username=form.username).exists():
                return json_response(error=f'已存在登录名为【{form.username}】的用户')
            form.password_hash = User.make_password(form.pop('password'))
            # form.created_by = request.user
            User.objects.create(**form)
        return json_response(error=error)

    def patch(self, request):
        form, error = JsonParser(
            Argument('id', type=int, help='请指定操作对象'),
            Argument('username', required=False),
            Argument('password', required=False),
            Argument('nickname', required=False),
            Argument('role_id', required=False),
            Argument('is_active', type=bool, required=False),
        ).parse(request.body, True)
        if error is None:
            if form.get('password'):
                form.token_expired = 0
                form.password_hash = User.make_password(form.pop('password'))
            User.objects.filter(pk=form.pop('id')).update(**form)
        return json_response(error=error)

    def delete(self, request):
        form, error = JsonParser(
            Argument('id', type=int, help='请指定操作对象')
        ).parse(request.GET)
        if error is None:
            user = User.objects.filter(pk=form.id).first()
            if user:
                if user.type == 'ldap':
                    return json_response(error='ldap账户无法删除，请使用禁用功能来禁止该账户访问系统')
                user.role_id = None
                user.deleted_at = human_datetime()
                user.deleted_by = request.user
                user.save()
        return json_response(error=error)


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
