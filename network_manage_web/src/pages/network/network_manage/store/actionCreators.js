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

export const getNetworkIpDetailsInfo = (id, ipDetailFilter) => {
  // var pageSize = pagination.pageSize
  // var currentPage = pagination.current
  // var ipStatusFilter = null
  // var ipTypeFilter = null
  // var columnKeySorter = null
  // var orderSorter = null
  return (dispatch) => {
    http.get(`/api/networks_manage/get_network_ip_details/?id=${id}&current_page=${ipDetailFilter['currentPage']}&page_size=${ipDetailFilter['pageSize']}&ip_status=${ipDetailFilter['ipStatusFilter']}&ip_type=${ipDetailFilter['ipTypeFilter']}&columnKey=${ipDetailFilter['columnKeySorter']}&order=${ipDetailFilter['orderSorter']}`)
      .then((res) => {
        res['ip_filter'] = ipDetailFilter
        dispatch({
          type: constant.GET_IP_DETAIL_INFO,
          value: res
        })
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}

export const handleIpDetailsTableChange  = (pagination, filters, sorter, id) => {
  var ipDetailFilter = new Object()
  // var pageSize = pagination.pageSize
  // var currentPage = pagination.current
  // var ipStatusFilter = filters.ip_status
  // var ipTypeFilter = filters.ip_type
  var columnKeySorter = null
  var orderSorter = null
  if(sorter.hasOwnProperty('columnKey')){
    columnKeySorter = sorter.columnKey
    orderSorter = sorter.order
  }
  ipDetailFilter['pageSize'] = pagination.pageSize
  ipDetailFilter['currentPage'] = pagination.current
  ipDetailFilter['ipStatusFilter'] = filters.ip_status
  ipDetailFilter['ipTypeFilter'] = filters.ip_type
  ipDetailFilter['columnKeySorter'] = columnKeySorter
  ipDetailFilter['orderSorter'] = orderSorter

  return (dispatch) => {
    http.get(`/api/networks_manage/get_network_ip_details/?id=${id}&current_page=${ipDetailFilter['currentPage']}&page_size=${ipDetailFilter['pageSize']}&ip_status=${ipDetailFilter['ipStatusFilter']}&ip_type=${ipDetailFilter['ipTypeFilter']}&columnKey=${ipDetailFilter['columnKeySorter']}&order=${ipDetailFilter['orderSorter']}`)
      .then((res) => {
        res['ip_filter'] = ipDetailFilter
        dispatch({
          type: constant.GET_IP_DETAIL_INFO,
          value: res
        })
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}


export const handleIpDetailSelected = (selectRows) =>({
  type: constant.IP_DETAILS_SELECTED,
  value: selectRows
}) 

export const handleEidtIpDetail = () =>({
  type: constant.EDIT_IP_DETAIL,
}) 

export const handleResolveConflict = () => ({
  type: constant.RESOLVE_IP_DETAIL_CONFLICT,
})

export const handleConvertToManual = () => ({
  type: constant.CONVERT_TO_MANUAL,
})

export const handleEditIpDetailModalCancel = () =>({
  type: constant.EDIT_IP_DETAIL_CANCEL,
}) 


export const handleEditIpDetailSubmit = (value) => {
  return (dispatch) => {
    http.patch('/api/networks_manage/edit_ip_details/', value)
      .then((res) => {
        dispatch({
          type: constant.FRESH_IP_DETAIL,
        })
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}

export const resloveIpDeatailCancel = () => ({
  type: constant.RESOLVE_IP_CONFLICT_CANCEL,
})

export const resloveIpDeataiOk = (value) => {
  return (dispatch) => {
    http.post('/api/networks_manage/resolve_ip_conflict/', value)
      .then((res) => {
        dispatch({
          type: constant.FRESH_IP_DETAIL,
        })
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}

export const convertIpManualCancel = () => ({
  type: constant.CONVERT_IP_MANUAL_CANCEL
}) 

export const convertIpManualOk = (value) => {
  return (dispatch) => {
    http.post('/api/networks_manage/convert_ip_manual/', value)
      .then((res) => {
        dispatch({
          type: constant.FRESH_IP_DETAIL,
        })
    })
    .catch(function (error) {
    console.log(error);
    });
  }
} 