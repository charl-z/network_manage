import { fromJS, List, Map  } from 'immutable'
import * as constant from './actionTypes'
import { handleGetAllNetworkQueryInfo } from './actionCreators'

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
})

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
    default:
      return state
  }
}