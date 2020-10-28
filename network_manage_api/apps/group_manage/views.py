from group_manage.models import NetworkGroup
from libs.tool import json_response
import json
# Create your views here.


def get_all_group_name(request):
	"获取所有的分组名称"
	all_groups = NetworkGroup.objects.values_list('name', flat=True)
	data = dict()
	result = list(all_groups)
	result.insert(0, "")
	data["result"] = result
	data["status"] = "success"
	return json_response(data)


def parent_array_to_dig(parent_array, name_dict):
	res = []
	for i in parent_array:
		if i in list(name_dict.keys()):
			res.append(name_dict[i])
	return res


def get_group_to_infos(request):
	"""获取分组对应的信息"""
	group = request.GET.get("group")
	group_info = NetworkGroup.objects.get(name=group)
	parent_array = json.loads(group_info.parent_array)
	networks = json.loads(group_info.networks)

	parent_group = ''
	if parent_array:
		parent_group = parent_array[-1]
	data = dict()
	result = dict()
	result['parent_array'] = parent_group
	result['networks'] = networks

	data["status"] = "success"
	data["result"] = result
	return json_response(data)


def new_build_group(request):
	data = dict()
	if request.method == "POST":
		post_data = json.loads(str(request.body, encoding='utf-8'))
		parent_group_name = post_data.get('parent_group_name')
		group_name = post_data.get('group_name')
		# 校验新建的分组是否存在
		if NetworkGroup.objects.filter(name=group_name):
			data["status"] = "fail"
			data['result'] = "分组已存在"
			return json_response(data)

		if not parent_group_name:
			NetworkGroup.objects.create(name=group_name, parent_array=[], haschild=False)
		else:
			parent_name_info = NetworkGroup.objects.get(name=parent_group_name)
			parent_array = json.loads(parent_name_info.parent_array)
			if len(parent_array) >= 4:
				data["status"] = "fail"
				data['result'] = "分组最大支持5级"
				return json_response(data)
				# return HttpResponse(json.dumps(data), content_type="application/json")

			NetworkGroup.objects.filter(name=parent_group_name).update(haschild=True)
			parent_array.append(parent_group_name)
			NetworkGroup.objects.create(name=group_name, parent_array=json.dumps(parent_array), haschild=False)

		data["status"] = "success"
		return json_response(data)
		# return HttpResponse(json.dumps(data), content_type="application/json")
	if request.method == "PUT":
		post_data = json.loads(str(request.body, encoding='utf-8'))
		current_group = post_data.get('group_name')
		pre_group = post_data.get('edit_pre')  # 编辑修改前分组的名称

		if pre_group == current_group:
			data["status"] = "success"
			return json_response(data)
			# return HttpResponse(json.dumps(data), content_type="application/json")

		if NetworkGroup.objects.filter(name=current_group):
			data["status"] = "fail"
			data['result'] = "分组已存在"
			return json_response(data)
			# return HttpResponse(json.dumps(data), content_type="application/json")

		group_infos = NetworkGroup.objects.filter(parent_array__icontains='"'+pre_group+'"')  # 修改所有parent_array信息
		for group in group_infos:
			parent_array = json.loads(group.parent_array)
			parent_array[parent_array.index(pre_group)] = current_group
			NetworkGroup.objects.filter(name=group.name).update(parent_array=json.dumps(parent_array))
		NetworkGroup.objects.filter(name=pre_group).update(name=current_group)

		data["status"] = "success"
		return json_response(data)
	if request.method == "DELETE":
		# print(request.body)
		post_data = json.loads(str(request.body, encoding='utf-8'))
		group_name = post_data.get('group_name')
		NetworkGroup.objects.filter(parent_array__icontains='"' + group_name + '"').delete()
		NetworkGroup.objects.filter(name=group_name).delete()
		data["status"] = "success"
		return json_response(data)


def get_network_group_info(request):
	"""最多支持5级分组"""
	all_groups = NetworkGroup.objects.all().order_by("id")
	data = dict()
	result = []
	count = 0
	group_tree = dict()
	for group in all_groups:
		parent_array = json.loads(group.parent_array)
		parent_array_dig = parent_array_to_dig(parent_array, group_tree)
		if len(parent_array) == 1:
			group_tree[group.name] = len(result[parent_array_dig[0]]['children'])
			if group.haschild:
				result[parent_array_dig[0]]['children'].append({"title": group.name, "key": group.name, "children": []})
			else:
				result[parent_array_dig[0]]['children'].append({"title": group.name, "key": group.name})

		elif len(parent_array) == 2:
			group_tree[group.name] = len(result[parent_array_dig[0]]['children'][parent_array_dig[1]]['children'])
			if group.haschild:
				result[parent_array_dig[0]]['children'][parent_array_dig[1]]['children'].append({"title": group.name, "key": group.name, "children": []})

			else:
				result[parent_array_dig[0]]['children'][parent_array_dig[1]]['children'].append(
					{"title": group.name, "key": group.name})
		elif len(parent_array) == 3:
			group_tree[group.name] = len(result[parent_array_dig[0]]['children'][parent_array_dig[1]]['children'][parent_array_dig[2]]['children'])
			if group.haschild:
				result[parent_array_dig[0]]['children'][parent_array_dig[1]]['children'][parent_array_dig[2]]['children'].append({"title": group.name, "key": group.name, "children": []})
			else:
				result[parent_array_dig[0]]['children'][parent_array_dig[1]]['children'][parent_array_dig[2]][
					'children'].append({"title": group.name, "key": group.name})

		elif len(parent_array) == 4:
			group_tree[group.name] = result[parent_array_dig[0]]['children'][parent_array_dig[1]]['children'][parent_array_dig[2]]['children'][parent_array_dig[3]]['children']
			if group.haschild:
				result[parent_array_dig[0]]['children'][parent_array_dig[1]]['children'][parent_array_dig[2]]['children'][parent_array_dig[3]]['children'].append({"title": group.name, "key": group.name, "children": []})

			else:
				result[parent_array_dig[0]]['children'][parent_array_dig[1]]['children'][parent_array_dig[2]]['children'][parent_array_dig[3]]['children'].append({"title": group.name, "key": group.name})

		else:
			if group.haschild:
				result.append({"title": group.name, "key": group.name, "children": []})
			else:
				result.append({"title": group.name, "key": group.name})
			group_tree[group.name] = count
			count += 1

	data["status"] = "success"
	data["result"] = result
	return json_response(data)

	