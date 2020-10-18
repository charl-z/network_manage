# -*-coding:utf8-*-
"""
Django settings for django_auto_test project.

Generated by 'django-admin startproject' using Django 1.11.3.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""

import os
import sys
import re
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))
sys.path.insert(0, os.path.join(BASE_DIR, 'bin'))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'dkvdf&22^-l!84!s-74ws7r0)-uwka(avdf+o8m_a2x=yj66t-'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]
APPEND_SLASH=False
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'apps.setting',
    'channels',
    'device_query',
    'network_query',
    'group_manage',
    'networks_manage',
    'account'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # 按顺序
    'libs.middleware.AuthenticationMiddleware'
]
# MIDDLEWARE = [
#     'django.middleware.security.SecurityMiddleware',
#     # 'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'libs.middleware.AuthenticationMiddleware'
#     # 'libs.middleware.HandleExceptionMiddleware',
#     # 'django.middleware.csrf.CsrfViewMiddleware',
#     # 'django.contrib.auth.middleware.AuthenticationMiddleware',
#     # 'django.contrib.messages.middleware.MessageMiddleware',
#     # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
#     'corsheaders.middleware.CorsMiddleware',  # 按顺序
#     # 'django.middleware.common.CommonMiddleware',
# ]
CORS_ORIGIN_ALLOW_ALL = True
ROOT_URLCONF = 'network_manage.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'network_manage.wsgi.application'
ASGI_APPLICATION = 'network_manage.routing.application'


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'device_query',
#         'USER': 'root',
#         'PASSWORD': '251493584wdy',
#         'HOST': '47.96.156.191',
#         'OPTIONS': {
#             "init_command": "SET foreign_key_checks = 0;",
#         },
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'device_query',
        'USER': 'postgres',
        # 'PASSWORD': 'mypassword',
        'HOST': '127.0.0.1',
        'PORT': '5430',
    }
}



# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
TIME_ZONE = 'Asia/Shanghai'
USE_TZ = True
USE_I18N = True
USE_L10N = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATIC_URL = '/static/'


LOG_DIR = os.path.join(BASE_DIR, 'log')
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# LOGGING = {
#     'version': 1,
#     # 日志格式
#     'formatters': {
#         'standard': {
#             'format': '%(asctime)s %(pathname)s:%(funcName)s:%(lineno)d %(levelname)s - %(message)s'
#
#         }
#     },
#     'handlers': {
#         'console_handler': {
#             'level': 'INFO',
#             'class': 'logging.StreamHandler',
#             'formatter': 'standard'
#         },
#         'file_handler': {
#             'level': 'INFO',
#             'class': 'logging.handlers.RotatingFileHandler',
#             'filename': os.path.join(LOG_DIR, 'backend.log'),
#             'maxBytes': 1024*1024*1024,
#             'backupCount': 5,
#             'formatter': 'standard',
#             'encoding': 'utf-8'
#             }
#     },
#     'loggers': {
#         'django': {
#             'handlers': ['console_handler', 'file_handler'],
#             'level': 'INFO'
#              }
#     }
# }


# CACHES = {
#     "default": {
#         "BACKEND": "django_redis.cache.RedisCache",
#         "LOCATION": "redis://127.0.01:4580/1",
#         "OPTIONS": {
#             "CLIENT_CLASS": "django_redis.client.DefaultClient",
#             "PASSWORD": "123456789"
#         }
#     }
# }
# # 频道层缓存
# CHANNEL_LAYERS = {
#     "default": {
#         "BACKEND": "channels_redis.core.RedisChannelLayer",
#         "CONFIG": {
#             "hosts": ["redis://:123456789@47.96.156.191:4580/2"],
#             # "symmetric_encryption_keys": [SECRET_KEY],
#         },
#     },
# }

# 终端过期时间，最好小于等于 CUSTOM_SESSION_EXIPRY_TIME
CUSTOM_TERMINAL_EXIPRY_TIME = 60 * 15      # 秒

# 用户登陆过期时间
LOGIN_EXIPRY_TIME = 5 * 60

AUTHENTICATION_EXCLUDES = (
    '/account/login/',
    '/network_query/exec_network_query_task/',
    '/device_query/exec_device_query_task/',
    re.compile('/apis/.*'),
)
