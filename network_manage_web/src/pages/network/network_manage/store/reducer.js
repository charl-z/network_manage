import { fromJS, Map  } from 'immutable'
import * as constant from './actionTypes'
import { PAGE_SIZE_OPTION } from '../../../../libs/functools'

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
  ipDetailSelectedRows: [],
  freshFlag: false,  //页面内容更新后的，标志位
  ipDetailFilter: Map({
    ipStatusFilter: null,
    ipTypeFilter: null,
    columnKeySorter: null,
    orderSorter: null,
    pageSize: 30,
    currentPage: 1,
  }),
  isResolveConflict: false,
  isConvertToManual: false,
  ResolveIpConflictModalVisible: false,
  ConvertToManualModalVisible: false,
  iPDetailsPagination: Map({
    showSizeChanger: true,
    current: 1,
    pageSize: 30,
    total: 0,
    pageSizeOptions: PAGE_SIZE_OPTION,
  }),
  EditIpDetailModalVisible: false,
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
  return state.merge({
    'exportNetworkModalVisible': true,
    'exportNetworkData': action.value
  })
}

const handleImportNetworks = (state, action) => {
  return state.merge({
    'importNetworkModalVisible': true,
  })
}

const handleImportNetworksCancel = (state, action) => {
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
  iPDetailsPagination['current'] = action.value.ip_filter.currentPage
  iPDetailsPagination['pageSize'] = action.value.ip_filter.pageSize

  return state.merge({
    'ipDetailInfos': action.value.result,
    'iPDetailsPagination': Map(iPDetailsPagination),
    'ipDetailFilter': Map(action.value.ip_filter)
  })
};


function isAllConflictAddress(data) {
  if(data.length === 0){
    return false
  }
  console.log("data:", data)
  for(var i=0; i<data.length; i++){
    if(data[i].ip_type !== "冲突地址"){
      return false
	  }
  }
  return true
}

function isAllMauAddress(data) {
  if(data.length === 0){
    return false
  }
  for(var i=0; i<data.length; i++){
    if(data[i].ip_type !== "未管理" || data[i].query_mac === '' || data[i].manual_mac !== ''){
      return false
	  }
  }
  return true
}

const handleIpDetailSelected = (state, action) => {
  return state.merge({
    'ipDetailSelectedRows': action.value,
    'isResolveConflict': isAllConflictAddress(action.value),
    'isConvertToManual': isAllMauAddress(action.value)
  })
}

const handleEidtIpDetail = (state, action) => {
  return state.merge({
    'EditIpDetailModalVisible': true
  })
}

const handleEditIpDetailModalCancel = (state, action) => {
  return state.merge({
    'EditIpDetailModalVisible': false
  })
}

const handleEditIpDetailSubmit = (state, action) => {
  var freshFlag = state.getIn(['freshFlag'])
  return state.merge({
    'freshFlag': !freshFlag,
    'EditIpDetailModalVisible': false,
    'ResolveIpConflictModalVisible': false,
    'ConvertToManualModalVisible': false,
    'ipDetailSelectedRows': false,
    'isResolveConflict': false,
    'isConvertToManual': false
  })
}

const handleResolveConflict = (state, action) => {
  return state.merge({
    'ResolveIpConflictModalVisible': true
  })
}

const handleResolveConflictCancel = (state, action) => {
  return state.merge({
    'ResolveIpConflictModalVisible': false
  })
}

const handleConvertToManual = (state, action) => {
  return state.merge({
    'ConvertToManualModalVisible': true
  })
}

const convertIpManualCancel = (state, action) => {
  return state.merge({
    'ConvertToManualModalVisible': false
  })
}

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
    case constant.IP_DETAILS_SELECTED:
      return handleIpDetailSelected(state, action)
    case constant.GET_IP_DETAIL_INFO:
      return getIpDetailsInfo(state, action)
    case constant.EDIT_IP_DETAIL:
      return handleEidtIpDetail(state, action)
    case constant.EDIT_IP_DETAIL_CANCEL:
      return handleEditIpDetailModalCancel(state, action)
    case constant.FRESH_IP_DETAIL:
      return handleEditIpDetailSubmit(state, action)
    case constant.RESOLVE_IP_DETAIL_CONFLICT:
      return handleResolveConflict(state, action)
    case constant.RESOLVE_IP_CONFLICT_CANCEL:
      return handleResolveConflictCancel(state, action)
    case constant.CONVERT_TO_MANUAL:
      return handleConvertToManual(state, action)
    case constant.CONVERT_IP_MANUAL_CANCEL:
      return convertIpManualCancel(state, action)

    default:
      return state
  }
}