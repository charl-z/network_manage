from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from libs.tool import json_response, get_request_real_ip
from account.models import User
import traceback
import time


class HandleExceptionMiddleware(MiddlewareMixin):
    """
    处理试图函数异常
    """

    def process_exception(self, request, exception):
        traceback.print_exc()
        return json_response(error='Exception: %s' % exception)


class AuthenticationMiddleware(MiddlewareMixin):
    """
    登录验证
    """
    def process_request(self, request):
        if request.path in settings.AUTHENTICATION_EXCLUDES:
            return None
        if any(x.match(request.path) for x in settings.AUTHENTICATION_EXCLUDES if hasattr(x, 'match')):
            return None
        # print("request.META:", request.META)
        access_token = request.META.get('HTTP_X_TOKEN') or request.GET.get('x-token')
        if access_token and len(access_token) == 32:
            # x_real_ip = request.META.get('REMOTE_ADDR', '')
            user = User.objects.filter(access_token=access_token).first()
            if user and user.token_expired >= time.time() and user.is_active:
                request.user = user
                if request.path != '/notify/':
                    user.token_expired = time.time() + settings.LOGIN_EXIPRY_TIME
                user.save()
                return None
        response = json_response(error="验证失败，请重新登录")
        response.status_code = 401
        return response
