export default [
  {icon: 'desktop', title: '工作台', auth: 'home.home.view', path: '/home'},
  {icon: 'cloud-server', title: '主机管理', auth: 'host.host.view', path: '/host'},
  {
    icon: 'code', title: '批量执行', auth: 'exec.task.do|exec.template.view', child: [
      {title: '执行任务', auth: 'exec.task.do', path: '/exec/task'},
      {title: '模板管理', auth: 'exec.template.view', path: '/exec/template'},
    ]
  },
]
