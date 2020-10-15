from django.utils.deprecation import MiddlewareMixin


class M1(MiddlewareMixin):
	def process_request(self, request):
		print('M1.request')

	def process_view(self, request, callback, callback_args, callback_kwargs):
		print("M1.process_view")

	def process_response(self, request, response):
		print('M1.response')
		return response
