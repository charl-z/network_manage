import * as constant from './actionTypes'
import http from '../../../../libs/http';

export const handleBuildNetworkCancel = () => ({
  type: constant.HANDLE_BUILD_NETWORKS_CANCEL,
})


export const getALLGroupName = (data) => ({
  type: constant.HANDLE_BUILD_NETWORKS,
  value: data 
})

export const getALLNetworks  = (data) => ({
  type: constant.GET_ALL_NETWORK,
  value: data 
})

export const getAllNetworksInfo  = (selectGroup) => {
  return (dispatch) => {
    http.get(`/api/networks_manage/get_all_networks/?group=${selectGroup}`)
    .then((res) => {
      console.log(res)
      dispatch(getALLNetworks(res.result))
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const handleBuildNetworks = () => {
  return (dispatch) => {
    http.get('/api/group_manage/get_all_group_name/')
    .then((res) => {
      dispatch(getALLGroupName(res.result))
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const handleNetworkManageSubmit  = (values) => {
  values.networks = values.networks.replace(/\n/g, " ")
  return (dispatch) => {
    http.post('/api/networks_manage/build_network/', values)
    .then((res) => {
      dispatch(getAllNetworksInfo(values.parent_group_name))
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}