import { fromJS, List, Map  } from 'immutable'
import * as constant from './actionTypes'
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
  console.log("handleConsoleCancel:", action)
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
      'selectedRowKeys': []
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
    default:
      return state
  }
}