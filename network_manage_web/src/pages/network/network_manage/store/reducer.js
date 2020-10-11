import { fromJS, Map  } from 'immutable'
import * as constant from './actionTypes'

const defaultState = fromJS({
  allGroupName: [],
  BuildNetworksVisible: false,
  networInfos: [],
  selectedRowKeys: [],
  deleteNetworkModalVisible: false,
  exportNetworkModalVisible: false,
  exportNetworkData: [],
  importNetworkModalVisible: false,
  importNeworkErrorMessages: '',
  importNetworLoading: false,
  ipDetailInfos: [],
  iPDetailsPagination: Map({
    showSizeChanger: true,
    current: 1,
    pageSize: 30,
    total: 0
  }),
})

const handleBuildNetworks = (state, action) => {
  action.value.splice(0, 1)
  return state.merge({
    'BuildNetworksVisible': true,
    'allGroupName': action.value,
  })
}

const handleBuildNetworkCancel  = (state, action) => {
  return state.merge({
    'BuildNetworksVisible': false,
  })
}

const getALLNetworks = (state, action) => {
  return state.merge({
    'BuildNetworksVisible': false,
    'networInfos': action.value,
    'selectedRowKeys': [],
    'deleteNetworkModalVisible': false,
    'exportNetworkModalVisible': false,
    'importNetworkLoading': false,
    'importNeworkErrorMessages': ''
  })
}

const handleNetworksSelected = (state, action) => {
  return state.merge({
    'selectedRowKeys': action.value
  })
}

const handleDeleteNetworks = (state, action) => {
  return state.merge({
    'deleteNetworkModalVisible': true
  })
}

const deleteNetworkMoadlCancel = (state, action) => {
  return state.merge({
    'deleteNetworkModalVisible': false
  })
}

const handleExportNetworks = (state, action) => {
  // console.log("action:", action)
  return state.merge({
    'exportNetworkModalVisible': true,
    'exportNetworkData': action.value
  })
}

const handleImportNetworks = (state, action) => {
  // console.log("action:", action)
  return state.merge({
    'importNetworkModalVisible': true,
  })
}

const handleImportNetworksCancel = (state, action) => {
  // console.log("action:", action)
  return state.merge({
    'importNetworkModalVisible': false,
  })
}

const handleExportNetworksCancel = (state, action) => {
  return state.merge({
    'exportNetworkModalVisible': false
  })
}

const handleCSVData = (state, action) => {
  if(action.value.status === 'success'){
    return state.merge({
      'importNetworkModalVisible': false,
      'importNetworkLoading': false
    })
  }else{
    return state.merge({
      'importNetworkModalVisible': true,
      'importNeworkErrorMessages': action.value.result,
      'importNetworkLoading': false
    })
  }
}

const handleCSVDataLoading = (state, action) => {
  return state.merge({
    'importNetworkLoading': true
  })
}
 

const getIpDetailsInfo  = (state, action) => {
  var iPDetailsPagination = state.getIn(['iPDetailsPagination']).toObject()
  iPDetailsPagination['total'] = action.value.total_ips  
  iPDetailsPagination['current'] = action.value.current_page
  iPDetailsPagination['pageSize'] = action.value.page_size
  return state.merge({
    'ipDetailInfos': action.value.result,
    'iPDetailsPagination': Map(iPDetailsPagination)
  })
};


export default (state = defaultState, action) => {
  switch (action.type) {
    case constant.HANDLE_BUILD_NETWORKS:
      return handleBuildNetworks(state, action)
    case constant.HANDLE_BUILD_NETWORKS_CANCEL:
      return handleBuildNetworkCancel(state, action)
    case constant.GET_ALL_NETWORK:
      return getALLNetworks(state, action)
    case constant.NETWORK_SELECTED:
      return handleNetworksSelected(state, action)
    case constant.DETELE_NETWORK:
      return handleDeleteNetworks(state, action)
    case constant.DETELE_NETWORK_CANCEL:
      return deleteNetworkMoadlCancel(state, action)
    case constant.NETWORK_EXPORT:
      return handleExportNetworks(state, action)
    case constant.NETWORK_EXPORT_CANCEL:
      return handleExportNetworksCancel(state, action)
    case constant.NETWORK_IMPORT:
      return handleImportNetworks(state, action)
    case constant.NETWORK_IMPORT_CANCEL:
      return handleImportNetworksCancel(state, action)
    case constant.HANDLE_CSV_DATA:
      return handleCSVData(state, action)
    case constant.HANDLE_CSV_DATA_START:
      return handleCSVDataLoading(state, action)

    case constant.GET_IP_DETAIL_INFO:
        return getIpDetailsInfo(state, action)
      
    
    default:
      return state
  }
}