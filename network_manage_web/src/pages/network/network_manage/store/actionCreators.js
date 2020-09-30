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

export const handleNetworkManageSubmit = (values) => {
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

export const deleteNetworksOk = (selectedRowKeys, selectGroupName) => {
  var param={networks: selectedRowKeys}
  return (dispatch) => {
    http.delete('/api/networks_manage/build_network/', {data: param})
      .then((res) => {
        // console.log("res:", res)
        dispatch(getAllNetworksInfo(selectGroupName))
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}

export const handleCSVtData = (file, selectGroupName) => {
  return (dispatch) => {
    dispatch({
      type: constant.HANDLE_CSV_DATA_START,
    })
    http.post('/api/networks_manage/patch_import_networks/', {data: file})
      .then((res) => {
        dispatch({
          type: constant.HANDLE_CSV_DATA,
          value: res 
        })
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(
        () => {
          dispatch(getAllNetworksInfo(selectGroupName))
        })
  }
}

export const handleImportNetwork = () => ({
  type: constant.NETWORK_IMPORT,
})

export const importNetworkMoadlCancel  = () => ({
  type: constant.NETWORK_IMPORT_CANCEL,
})
export const handleNetworksSelected = (selectedRowKeys) => ({
  type: constant.NETWORK_SELECTED,
  value: selectedRowKeys
})

export const handleDeleteNetworks = () => ({
  type: constant.DETELE_NETWORK,
})

export const deleteNetworkMoadlCancel = () => ({
  type: constant.DETELE_NETWORK_CANCEL,
})


export const handleExportNetworks = (selectedRowKeys) => {
  return (dispatch) => {
    http.post('/api/networks_manage/patch_export_networks/', {networks: selectedRowKeys})
      .then((res) => {
        console.log("res:", res.result)
        dispatch({
          type: constant.NETWORK_EXPORT,
          value: res.result
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  }

}



export const exportNetworkMoadlCancel = () => ({
  type: constant.NETWORK_EXPORT_CANCEL,
}) 