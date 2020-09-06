export default [
  {icon: 'desktop', title: '工作台', auth: 'home.home.view', path: '/home'},
  {
    icon: 'code', title: '设备探测', auth: 'exec.task.do|exec.template.view', child: [
      {title: '网络探测', auth: 'exec.task.do', path: '/network/network_query'},
      {title: '设备探测', auth: 'exec.template.view', path: '/network/device_query'},
    ]
  },
  {
    icon: 'setting', title: '系统管理', auth: "system.account.view|system.role.view|system.setting.view", child: [
      {title: '账户管理', auth: 'system.account.view', path: '/system/account'},
      {title: '角色管理', auth: 'system.role.view', path: '/system/role'},
      {title: '系统设置', auth: 'system.setting.view', path: '/system/setting'},
    ]
  },
]
