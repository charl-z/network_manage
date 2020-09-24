import { fromJS,List  } from 'immutable'
import * as constant from './actionTypes'

const defaultState = fromJS({
  allGroupName: [],
  BuildNetworksVisible: false,
  networInfos: []
})

const handleBuildNetworks = (state, action) => {
  console.log(action.value)
  action.value.splice(0,1)
  console.log(action.value)
  // console.log("action:", action)
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
    'networInfos': action.value
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
    default:
      return state
  }
}