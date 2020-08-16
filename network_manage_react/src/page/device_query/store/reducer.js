import { fromJS,List  } from 'immutable'
import * as constant from './actionTypes'
import { constants } from '.';
const defaultState = fromJS({
  selectedRowKeys: "",
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
  showConsolePassworkShow: true, // 控制远程登陆密码输入框展示，为ssh展示密码，telnet不展示
  consoleHostInfo: '',
  PortToMAC: '', //端口对应的转发表（即所有mac地址）
  PortToARP: '', //端口对应的ARP信息（即端口对应的ip和mac地址信息）

})

const getDeviceQuerySelect = (state, action) => {
  return state.merge({
    'selectedRowKeys': action.value
  })
};

const handleProtocolChange = (state, action) => {
  
  console.log("action:---", action)
  if(action.value === 'telnet'){
    return state.merge({
    'showConsolePassworkShow': false
     })
  }
  if(action.value === 'ssh'){
    return state.merge({
    'showConsolePassworkShow': true
     })
  }
  
};

const getAllDiviceInfos  = (state, action) => {
  return state.merge({
    'deviceQueryInfos': action.value.result,
    'totalDeivces': action.value.total_device,
    'checkDeviceQueryInputIps': false
  })
};

const getDiviceDetailsInfos  = (state, action) => {
  return state.merge({
    'getDeviceDetailsInfos': action.value,
  })
};

const handleDeviceQueryNewBuild  = (state, action) => {
  return state.merge({
    'newBuiltDeviceVisible': true
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
    'newBuiltDeviceVisible': false
  })
};

function handleDeviceQuerySubmit(state, action){
  if(action.value.status === 'success'){
    return state.merge({
      'newBuiltDeviceVisible': false,
      'checkDeviceQueryInputIps': true,
      'selectedRowKeys': []
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
    'getConsoleCheckInfo': ''
  })
};

function getConsoleSubmitInfo(state, action){
  console.log(action.value)
  if(action.value.protocol === 'telnet'){
    window.open(`/telnet/${action.value.hostname}`)
    return state.merge({
      'consonleLoginVisible': false,
      'showConsoleCheckInfo': false,
      'getConsoleCheckInfo': '',
      'ConsoleSubmitClickStatus': false,
      // 'consoleHostInfo': action.value.result
    })
  }

  if(action.value.protocol === 'ssh'){
    if(action.value.status === 'success'){
      window.open(`/ssh/${action.value.result.hostname}`)
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
    case constant.HANDLEPROTOCOLCHANGE:
      return handleProtocolChange(state, action)
    case constant.GET_DEVICE_PORT_MACS:
      console.log(action)
      return handleDevicePortMACS(state, action)
      
    case constant.GET_DEVICE_PORT_ARP:
      console.log(action)
      return handleDevicePortARP(state, action)

    
    default:
      return state
  }

}