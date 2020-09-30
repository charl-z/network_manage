import * as constant from './actionTypes'
import http from '../../../../libs/http';

export const getSelectQuery = (selectedRowKeys) => ({
  type: constant.SELECT_DEVICE_QUERY_LIST,
  value: selectedRowKeys
})

function handleAllDeviceQueryInfo(data){ //与箭头函数不同的写法
  return{
    type: constant.GET_ALL_DEVICE_QUERY_INFO,
    value: data
  }
}

export const getDeviceDetails = (data) => ({
    type: constant.GET_DEVICE_DETAILS_INFO,
    value: data.result
})

export const handleNewBuildDeviceQuery = () => ({
  type: constant.HANDLE_DEVICE_QUERY_NEW_BUILD,
})

export const handleDeviceQueryCancel = () => ({
  type: constant.HANDLE_DEVICE_QUERY_CANCEL,
})

export const handleConsoleCancel = () => ({
  type: constant.HANDLE_CONSOLE_CANCEL,
})

export const handleConsoleClick = (ipAddress) => ({
  type: constant.HANDLE_CONSOLE_CLICK,
  value: ipAddress
})

function handleDeviceQuerySubmitData(data){
  return{
    type: constant.HANDLE_DEVICE_QUERY_SUMBIT,
    value: data
  }
}

export const setupConsoleSubmitClickStatus = (data) => ({
  type: constant.SETUP_CONSOLE_SUBMIT_STATUS,
  value: data
})

export const handleProtocolChange  = (data) => ({
  type: constant.HANDLE_PROTOCOL_CHANGE,
  value: data
})


export const hanleAutoDeviceQuerySwitch  = (data) => ({
  type: constant.HANDLE_AUTO_DEVICE_QUERY_SWITCH,
  value: data
})

export const handleEditDeviceQuery  = (data) => ({
  type: constant.HANDLE_EDIT_DEVICE_QUERY,
  value: data
})


export const handleAddField = () => ({
  type: constant.HANDLE_ADD_FIELD,
})

export const handleDeleteModel  = (index) => ({
  type: constant.HANDLE_DELETE_MODEL,
  value: index
})

export const handleConsoleInfoSubmit = (values) => ({
  type: constant.GET_CONSOLE_SUBMIT_INFO,
  value: values
  })


export const getAllDeviceQueryInfo = (currentPage, pageSize) => {
  return (dispatch) => {
    http.get(`/api/device_query/get_device_query_info/?current_page=${currentPage}&page_size=${pageSize}`)
    .then((res) => {
      res["current_page"] = currentPage
      dispatch(handleAllDeviceQueryInfo(res))
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const handleDeleteDeviceQuery = (values) => {
  // 传递的values是一个数组类型
  var delete_ip_ids = new Object();
  delete_ip_ids["ids"] = values
  return (dispatch) => {
    http.post('/api/device_query/del_device_query/', delete_ip_ids)
      .then((res) => {
        dispatch(handleDeviceQuerySubmitData(res)) //删除设备探测后，出发刷新页面
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const handleStartDeviceQuery  = (values) => {
  // 传递的values是一个数组类型
  var ids = new Object();
  ids["ids"] = values
  return (dispatch) => {
    http.post('/api/device_query/add_device_query_to_cache/', ids)
      .then((res) => {
          dispatch(handleDeviceQuerySubmitData(res)) //删除设备探测后，出发刷新页面
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const getDeviceQuerySubmit = (values, form, editShow) => {
  if(!editShow){
    values.device_ips = values.device_ips.replace(/\n/g, " ")
    return (dispatch) => {
      http.post('/api/device_query/add_device_query/', values)
        .then((res) => {
          res["form"] = form
          dispatch(handleDeviceQuerySubmitData(res)) 
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }else{
    return (dispatch) => {
      http.put('/api/device_query/add_device_query/', values)
        .then((res) => {
          res["form"] = form
          dispatch(handleDeviceQuerySubmitData(res)) 
      })
      .catch(function (error) {
      console.log(error);
      });
    }
  }
  
}

export const getAllDeviceDetailsInfo = (id) => {
  return (dispatch) => {
    http.get('/api/device_query/get_device_details/' + id + '/')
      .then((res) => {
        // console.log("res:", res)
        dispatch(getDeviceDetails(res)) 
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}

export const handleDevicePortToMAC = (data) => ({
  type: constant.GET_DEVICE_PORT_MACS,
  value: data
})

export const getDevicePortToMAC = (id) => {
  return (dispatch) => {
    http.get('/api/device_query/device_port_macs/' + id + '/')
      .then((res) => {
        dispatch(handleDevicePortToMAC(res.result)) 
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const handleModelChange  = (data) => ({
  type: constant.HANDLE_MODEL_CHANGE,
  value: data
})

export const handleDevicePortToARP = (data) => ({
  type: constant.GET_DEVICE_PORT_ARP,
  value: data
})
export const getDevicePortToARP = (id) => {
  return (dispatch) => {
    http.get('/api/device_query/device_port_arp/' + id + '/')
      .then((res) => {
        // console.log(id, res)
        dispatch(handleDevicePortToARP(res.result)) 
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const getDeviceQuerySearchInfo = (data) => ({
  type: constant.HANDLE_DEVICE_QUERY_SEARCH,
  value: data
})

export const handleDeviceQuerySearch = (value, currentPage, pageSize) => {
  return (dispatch) => {
    http.get(`/api/device_query/get_device_query_info/?current_page=${currentPage}&page_size=${pageSize}&search_ip=${value}`)
    .then((res) => {
      res["current_page"] = currentPage
      dispatch(handleAllDeviceQueryInfo(res))
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}

export const NetworkSetCancel = () => ({
  type: constant.NETWORK_SET_CANCEL,
})


export const handleNetworksSet = () => {
  return (dispatch) => {
    dispatch({
      type: constant.HANDLE_NETWORK_SET_LOADING
    })
    http.get('/api/device_query/get_device_to_networks/')
    .then((res) => {
      dispatch({
        type: constant.HANDLE_NETWORK_SET,
        value: res.result
      })
    })
    .catch(function (error) {
      console.log(error);
    })
  }
}

export const handleNetworkSetSubmit = (values) => {
  console.log(values)
  return (dispatch) => {
    http.post('/api/device_query/handle_networks_set/', values)
    .then((res) => {
      dispatch({
        type: constant.NETWORK_SET_SUBMIT,
      })
    })
    .catch(function (error) {
      console.log(error);
    })
  }
}

