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
