import { fromJS,List  } from 'immutable'
import * as constant from './actionTypes'

const defaultState = fromJS({
  allGroupName: [],
  BuildNetworksVisible: false,
  networInfos: [],
  selectedRowKeys: [],
  deleteNetworkModalVisible: false,
  exportNetworkModalVisible: false,
  exportNetworkData: []
})

const handleBuildNetworks = (state, action) => {
  action.value.splice(0,1)
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
    'exportNetworkModalVisible': false
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

const handleExportNetworksCancel = (state, action) => {
  return state.merge({
    'exportNetworkModalVisible': false
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
    default:
      return state
  }
}