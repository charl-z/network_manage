from django.db import models

# Create your models here.


class NetworkGroup(models.Model):
	name = models.TextField(verbose_name=u'分组名称', default='', unique=True)
	networks = models.TextField(verbose_name=u'网络', default='[]')
	# parent = models.TextField(verbose_name=u'父分组', default='')
	parent_array = models.TextField(verbose_name=u'父分组列表', default='')
	# child = models.TextField(verbose_name=u'子分组', default='')
	haschild = models.BooleanField(verbose_name=u'是否有孩子分组', default=False)

	def __str__(self):
		return self.name

	class Meta:
		db_table = "network_group"
		verbose_name = u"网络分组信息"
		verbose_name_plural = verbose_name
