import { fromJS, List, Map  } from 'immutable'
import * as constant from './actionTypes'
import {weeks} from '../../../../libs/constant'
import {Encrypt} from '../../../../libs/secret'

const defaultState = fromJS({
  selectedRowKeys: [],
  deviceQueryInfos: [],
  loading: false,
  newBuiltDeviceVisible: false,
  consonleLoginVisible: false, 
  checkDeviceQueryInputIps: false,  //页面展示设备探测任务组件刷新标志符，如果为ture，就去自动刷新
  getCheckDeviceQueryInputIpsInfo: "",
  getDeviceDetailsInfos: [],
  totalDeivces: 0,
  deviceQueryCurrentPage: 1,
  deviceQueryPageSize: 30,  //要属于pageSizeOptions数据中的一个参数pageSizeOptions={['30', '50', '100']}
  consoleIPAddress: '',
  getConsoleCheckInfo: '', //获取远程登陆返回得校验信息
  showConsoleCheckInfo: false,  //控制远程登陆对话框错误提示是否展示
  ConsoleSubmitClickStatus: false,  //控制远程登陆登陆按钮置灰
  showConsolePasswordShow: true, // 控制远程登陆密码输入框展示，为ssh展示密码，telnet不展示
  // consoleHostInfo: '',
  PortToMAC: '', //端口对应的转发表（即所有mac地址）
  PortToARP: '', //端口对应的ARP信息（即端口对应的ip和mac地址信息）
  DeivceQueryCron: '', //获取新建设备探测定时任务选择输入
  showDeivceQueryCron: false, //是否展示定时任务配置页面
  SelectTimeList: List([0]),  //记录的定时任务
  SelectModelValue: '', //定时任务下拉框获取的数据
  DeivceQueryEditShow: false, // 设备探测是否是编辑状态
  DeivceQueryEditContent: '',
  DeivceQueryEditTimeSelect: {},
  NetworkSet: Map({
    all_groups: [],
    networks: []
  }),
  NetworkSetVisible: false,
  NetworkSetLoading: false
})


const getDeviceQuerySelect = (state, action) => {
  return state.merge({
    'selectedRowKeys': action.value
  })
};

const handleProtocolChange = (state, action) => {
  if(action.value === 'telnet'){
    return state.merge({
    'showConsolePasswordShow': false
     })
  }
  if(action.value === 'ssh'){
    return state.merge({
    'showConsolePasswordShow': true
     })
  }
};

const getAllDiviceInfos  = (state, action) => {
  return state.merge({
    'deviceQueryInfos': action.value.data,
    'totalDeivces': action.value.total_device,
    'checkDeviceQueryInputIps': false,
    'getCheckDeviceQueryInputIpsInfo': '',
    'deviceQueryCurrentPage': action.value.current_page,
    'NetworkSetVisible': false,
    'NetworkSetLoading': false,
    
  })
};

const handleDeviceQuerySearch   = (state, action) => {
  return state.merge({
    'deviceQueryInfos': action.value.data,
    'totalDeivces': action.value.total_device,
    'checkDeviceQueryInputIps': false,
    'getCheckDeviceQueryInputIpsInfo': '',
    'deviceQueryCurrentPage': action.value.current_page
  })
};

const getDiviceDetailsInfos  = (state, action) => {
  return state.merge({
    'getDeviceDetailsInfos': action.value,
  })
};

const handleDeviceQueryNewBuild  = (state, action) => {
  return state.merge({
    'newBuiltDeviceVisible': true,
    'DeivceQueryEditShow': false,
    'DeivceQueryEditTimeSelect': '',
    'SelectTimeList': List([0]),
  })
};

const handleConsoleInfo = (state, action) => {
  return state.merge({
    'consonleLoginVisible': true,
    'consoleIPAddress': action.value,
  })
};

const handleDeviceQueryCancel  = (state, action) => {
  return state.merge({
    'newBuiltDeviceVisible': false,
    'showDeivceQueryCron': false,
  })
};

function hanleAutoDeviceQuerySwitch(state, action){
  return state.merge({
    'showDeivceQueryCron': action.value
  })
}

function handleModelChange(state, action){
  var SelectTimeList = state.getIn(['SelectTimeList'])
  return state.merge({
    'SelectModelValue': action.value.value,
    'SelectTimeList': SelectTimeList.splice(action.value.index, 1, action.value.modelSelectIndex),
    'CurrentSelectTimeIndex': action.value.index
  })
};

function handleDeviceQuerySubmit(state, action){
  if(action.value.status === 'success'){
    if(action.value.hasOwnProperty("form")){
      action.value.form.resetFields()
    }
    return state.merge({
      'newBuiltDeviceVisible': false,
      'checkDeviceQueryInputIps': true,
      'selectedRowKeys': [],
      'showDeivceQueryCron': false,
      'SelectTimeList': List([0])
    })
  }
  if(action.value.status === 'fail'){
    return state.merge({
      'newBuiltDeviceVisible': true,
      'checkDeviceQueryInputIps': false,
      'getCheckDeviceQueryInputIpsInfo': action.value.data
    })
  }
}

const handleConsoleCancel  = (state, action) => {
  return state.merge({
    'consonleLoginVisible': false,
    'showConsoleCheckInfo': false,
    'showConsolePasswordShow': true,
    'getConsoleCheckInfo': '',
  })
};

function getConsoleSubmitInfo(state, action){
  if(action.value.protocol === 'telnet'){
    window.open(`/telnet/${action.value.hostname}`)
    return state.merge({
      'consonleLoginVisible': false,
      'showConsoleCheckInfo': false,
      'getConsoleCheckInfo': '',
      'ConsoleSubmitClickStatus': false,
    })
  }

  if(action.value.protocol === 'ssh'){
    // if(action.value.status === 'success'){
      console.log("action.value:", action.value)
      var sshInfo = `ip=${action.value.hostname}&password=${action.value.password}&username=${action.value.username}&port=${action.value.port}`
      window.open(`/ssh/${Encrypt(sshInfo)}`)
      return state.merge({
        'consonleLoginVisible': false,
        'showConsoleCheckInfo': false,
        'getConsoleCheckInfo': '',
        'ConsoleSubmitClickStatus': false,
      })
  }
}

const setupConsoleSubmitClickStatus = (state, action) => {
  return state.merge({
    'showConsoleCheckInfo': true,
    'ConsoleSubmitClickStatus': action.value.status,
    'getConsoleCheckInfo':  action.value.result,
  })
};

const handleDevicePortMACS = (state, action) => {
  return state.merge({
    'PortToMAC': action.value,
  })
};

const handleDevicePortARP = (state, action) => {
  return state.merge({
    'PortToARP': action.value,
  })
};

const handleAddFiled  = (state, action) => {
  return state.merge({
    'SelectTimeList': state.getIn(['SelectTimeList']).push(0)
  })
};

const handleDeleteModel = (state, action) => {
  var SelectTimeList = state.getIn(['SelectTimeList']).toArray()
  var index = action.value
  SelectTimeList.splice(index, 1)
  return state.merge({
    'SelectTimeList': List(SelectTimeList),
  })
};

const handleCrontabTask = (crontabTask) => {
  var editSelectTime = new Object()
  var SelectTimeList = []
  crontabTask.map((item,index) => {
    item = item.split(" ")
    if(item[2] !== "*"){
      editSelectTime["model_" + index] = "每月"
      editSelectTime["day_" + index] = item[2] + "号"
      editSelectTime["hour_" + index] = item[1] + ":" + item[0]
      SelectTimeList.push(3)
    }
    else if(item[4] !== "*"){
      editSelectTime["model_" + index] = "每周"
      editSelectTime["week_" + index] = weeks[item[4]-1]
      editSelectTime["hour_" + index] = item[1] + ":" + item[0]
      SelectTimeList.push(2)
    }else if(item[1] === "*" && item[2] === "*" && item[3] === "*" && item[4] === "*"){
      editSelectTime["model_" + index] = "每小时"
      editSelectTime["minute_" + index] = item[0]
      SelectTimeList.push(0)
    }else{
      editSelectTime["model_" + index] = "每天"
      editSelectTime["hour_" + index] = item[1] + ":" + item[0]
      SelectTimeList.push(1)
    }
  })
  return [editSelectTime, SelectTimeList]
}


const handleEditDeviceQuery = (state, action) => {
  var crontab_task = JSON.parse(action.value.crontab_task)
  var editSelectTime = handleCrontabTask(crontab_task)
  return state.merge({
    'DeivceQueryEditContent': action.value,
    'DeivceQueryEditShow': true,
    'newBuiltDeviceVisible': true,
    "showDeivceQueryCron": action.value.auto_enable,
    'DeivceQueryEditTimeSelect': editSelectTime[0],
    "SelectTimeList": List(editSelectTime[1]),
  })
}; 

const handleNetworkSet = (state, action) => {
  return state.merge({
    'NetworkSet': Map(action.value),
    'NetworkSetLoading': false
  })
};

const handleNetworkSetLoading = (state, action) => {
  return state.merge({
    'NetworkSetVisible': true,
    'NetworkSetLoading': true
  })
};

const handleNetworkSetCancel =  (state, action) => {
  return state.merge({
    'NetworkSetVisible': false,
    'NetworkSetLoading': false
  })
};

const handleNetworkSetSubmit =  (state, action) => {
  return state.merge({
    'NetworkSetVisible': false,
  })
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case constant.SELECT_DEVICE_QUERY_LIST:
      return getDeviceQuerySelect(state, action);
    case constant.GET_ALL_DEVICE_QUERY_INFO:
      return getAllDiviceInfos(state, action);
    case constant.HANDLE_DEVICE_QUERY_NEW_BUILD:
      return handleDeviceQueryNewBuild(state, action)
    case constant.HANDLE_DEVICE_QUERY_SUMBIT:
      return handleDeviceQuerySubmit(state, action)
    case constant.HANDLE_DEVICE_QUERY_CANCEL:
      return handleDeviceQueryCancel(state, action)
    case constant.GET_DEVICE_DETAILS_INFO:
      return getDiviceDetailsInfos(state, action)
    case constant.HANDLE_CONSOLE_CLICK:
      return handleConsoleInfo(state, action)
    case constant.HANDLE_CONSOLE_CANCEL:
      return handleConsoleCancel(state, action)
    case constant.GET_CONSOLE_SUBMIT_INFO:
      return getConsoleSubmitInfo(state, action)
    case constant.SETUP_CONSOLE_SUBMIT_STATUS:
      return setupConsoleSubmitClickStatus(state, action)
    case constant.HANDLE_PROTOCOL_CHANGE:
      return handleProtocolChange(state, action)
    case constant.GET_DEVICE_PORT_MACS:
      return handleDevicePortMACS(state, action)
    case constant.GET_DEVICE_PORT_ARP:
      return handleDevicePortARP(state, action)
    case constant.HANDLE_DEVICE_QUERY_SEARCH:
      return handleDeviceQuerySearch(state, action)
    case constant.HANDLE_MODEL_CHANGE:
      return handleModelChange(state, action)
    case constant.HANDLE_AUTO_DEVICE_QUERY_SWITCH:
      return hanleAutoDeviceQuerySwitch(state, action)
    case constant.HANDLE_ADD_FIELD:
      return handleAddFiled(state, action)
    case constant.HANDLE_DELETE_MODEL:
      return handleDeleteModel(state, action)
    case constant.HANDLE_EDIT_DEVICE_QUERY:
      return handleEditDeviceQuery(state, action)
    case constant.HANDLE_NETWORK_SET:
      return handleNetworkSet(state, action)
    case constant.HANDLE_NETWORK_SET_LOADING:
      return handleNetworkSetLoading(state, action)
    case constant.NETWORK_SET_CANCEL:
      return handleNetworkSetCancel(state, action)
    case constant.NETWORK_SET_SUBMIT:
      return handleNetworkSetSubmit(state, action)
    default:
      return state
  }
}