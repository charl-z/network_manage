import { fromJS, List, Map  } from 'immutable'
import * as constant from './actionTypes'
import {weeks} from '../../../../libs/constant'
import {Encrypt} from '../../../../libs/secret'

const defaultState = fromJS({
  BuildNetworkQueryVisible: false,
  checkNetworkQueryInputIps: false,  //页面展示设备探测任务组件刷新标志符，如果为ture，就去自动刷新
  networkQueryInfos: [],
  getCheckNetworkQueryInputIpsInfo: [],
  selectedRowKeys: [],
  totalNetworks: 0,
  NetworkQueryCurrentPage: 1,
  NetworkQueryPageSize: 30,  //要属于pageSizeOptions数据中的一个参数pageSizeOptions={['30', '50', '100']}
  NetworkQueryDetailInfos: [],
  PortDetailInfos: [],
  NetworkQueryDetailsPagination: Map({
    showSizeChanger: true,
    current: 1,
    pageSize: 30,
    total: 0
  }),
  consonleLoginVisible: false,
  consoleIPAddress: '',
  getConsoleCheckInfo: '', //获取远程登陆返回得校验信息
  showConsoleCheckInfo: false,  //控制远程登陆对话框错误提示是否展示
  ConsoleSubmitClickStatus: false,  //控制远程登陆登陆按钮置灰
  showConsolePasswordShow: true, // 控制远程登陆密码输入框展示，为ssh展示密码，telnet不展示
  consoleHostInfo: '',
  showNetworkQueryCron: '',
  SelectTimeList: List([0]),
  NetworkQueryEditTimeSelect: {},
  NetworkQueryEditShow: false, // 设备探测是否是编辑状态
  NetworkQueryEditContent: ''
})

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


const handleConsoleInfo = (state, action) => {
  return state.merge({
    'consonleLoginVisible': true,
    'consoleIPAddress': action.value,
  })
};


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
    if(action.value.status === 'success'){
      var sshInfo = `ip=${action.value.result.hostname}&password=${action.value.result.password}&username=${action.value.result.username}&port=${action.value.result.port}`
      window.open(`/ssh/${Encrypt(sshInfo)}`)
      return state.merge({
        'consonleLoginVisible': false,
        'showConsoleCheckInfo': false,
        'getConsoleCheckInfo': '',
        'ConsoleSubmitClickStatus': false,
        'consoleHostInfo': action.value.result
      })
    }
    if(action.value.status === 'fail'){
      return state.merge({
        'consonleLoginVisible': true,
        'showConsoleCheckInfo': true,
        'ConsoleSubmitClickStatus': false,
        'getConsoleCheckInfo': action.value.result,
      })
    }
  }
}

const setupConsoleSubmitClickStatus = (state, action) => {
  return state.merge({
    'showConsoleCheckInfo': true,
    'ConsoleSubmitClickStatus': action.value.status,
    'getConsoleCheckInfo':  action.value.result,
  })
};

const handleBuildNetworkQuery = (state, action) => {
  return state.merge({
    'BuildNetworkQueryVisible': true,
    'NetworkQueryEditShow': false,
    'DeivceQueryEditTimeSelect': '',
    'SelectTimeList': List([0]),
  })
}

const handleNetworkQueryCancel = (state, action) => {
  return state.merge({
    'BuildNetworkQueryVisible': false,
    'getCheckNetworkQueryInputIpsInfo': ''
  })
}

const handleNetworkQuerySubmit  = (state, action) => {
  if(action.value.status === 'success'){
    if(action.value.hasOwnProperty("form")){
      action.value.form.resetFields()
    }
    return state.merge({
      'BuildNetworkQueryVisible': false,
      'checkNetworkQueryInputIps': true,
      'selectedRowKeys': [],
      'showNetworkQueryCron': false,
      'SelectTimeList': List([0])
    })
  }
  if(action.value.status === 'fail'){
    return state.merge({
      'BuildNetworkQueryVisible': true,
      'checkNetworkQueryInputIps': false,
      'getCheckNetworkQueryInputIpsInfo': action.value.data
    })
  }
}

const getAllNetworkQueryInfos = (state, action) => {
  return state.merge({
    'networkQueryInfos': action.value.data,
    'totalNetworks': action.value.total_network,
    'checkNetworkQueryInputIps': false,
    'getCheckNetworkQueryInputIpsInfo': ''
    // 'deviceQueryCurrentPage': action.value.current_page
  })
}

const getDeviceQuerySelect = (state, action) => {
  return state.merge({
    'selectedRowKeys': action.value
  })
}; 

const getNetworkDetailsInfos  = (state, action) => {
  var NetworkQueryDetailsPagination = state.getIn(['NetworkQueryDetailsPagination']).toObject()
  NetworkQueryDetailsPagination['total'] = action.value.total_ips  
  NetworkQueryDetailsPagination['current'] = action.value.current_page
  NetworkQueryDetailsPagination['pageSize'] = action.value.page_size
  return state.merge({
    'NetworkQueryDetailInfos': action.value.result,
    'NetworkQueryDetailsPagination': Map(NetworkQueryDetailsPagination)
  })
};

const getNetworkPortDetailsInfos  = (state, action) => {
  return state.merge({
    'PortDetailInfos': action.value,
  })
};

function hanleAutoNetworkQuerySwitch(state, action){
  return state.merge({
    'showNetworkQueryCron': action.value
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

const handleEditNetworkQuery = (state, action) => {
// console.log("action.value.:", action.value)

  var crontab_task = JSON.parse(action.value.crontab_task)
  var editSelectTime = handleCrontabTask(crontab_task)
  return state.merge({
    'NetworkQueryEditContent': action.value,
    'NetworkQueryEditShow': true,
    'BuildNetworkQueryVisible': true,
    "showNetworkQueryCron": action.value.auto_enable,
    'NetworkQueryEditTimeSelect': editSelectTime[0],
    "SelectTimeList": List(editSelectTime[1]),
  })
}; 

export default (state = defaultState, action) => {
  switch (action.type) {
    case constant.HANDLE_NETWORK_QUERY_BUILD:
      return handleBuildNetworkQuery(state, action);
    case constant.HANDLE_NETWORK_QUERY_CANCEL:
      return handleNetworkQueryCancel(state, action);
    case constant.HANDLE_NEWORK_QUERY_SUBMIT:
      return handleNetworkQuerySubmit(state, action);
    case constant.HANDLE_GET_ALL_NETWORK_QUERY_INFO:
      return getAllNetworkQueryInfos(state, action);
    case constant.SELECT_NETWORK_QUERY_LIST:
      return getDeviceQuerySelect(state, action);
    case constant.GET_NETWORK_DETAIL_INFO:
      return getNetworkDetailsInfos(state, action);
    case constant.GET_NETWORK_PORT_DETAIL_INFO:
      return getNetworkPortDetailsInfos(state, action);
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
    case constant.HANDLE_AUTO_NETWORK_QUERY_SWITCH:
      return hanleAutoNetworkQuerySwitch(state, action)
    case constant.HANDLE_MODEL_CHANGE:
      return handleModelChange(state, action)
    case constant.HANDLE_ADD_FIELD:
      return handleAddFiled(state, action)
    case constant.HANDLE_DELETE_MODEL:
      return handleDeleteModel(state, action)
    case constant.HANDLE_EDIT_NETWORK_QUERY:
      return handleEditNetworkQuery(state, action)
    default:
      return state
  }
}