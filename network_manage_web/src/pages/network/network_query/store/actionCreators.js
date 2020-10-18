import * as constant from './actionTypes'
import http from '../../../../libs/http';


export const handleBuildNetworkQuery = (selectGroup) => {
  return (dispatch) => {
    http.get('/api/group_manage/get_all_group_name/')
    .then((res) => {
      // console.log("res:", res)
      dispatch({
        type: constant.HANDLE_NETWORK_QUERY_BUILD,
        value: res.result
      })
    })
    .catch(function (error) {
      console.log(error);
    });

    if(selectGroup){
      http.get(`/api/network_query/get_groups_to_networks/?group=${selectGroup}`)
        .then((res) => {
          dispatch({
            type: constant.HANDLE_SELECT_GROUP_CHANGE,
            value: res.result
          }) 
        })
        .catch(function (error) {
          console.log(error);
        });
      }
    }
}



export const getSelectQuery = (selectedRowKeys) => ({
  type: constant.SELECT_NETWORK_QUERY_LIST,
  value: selectedRowKeys
})

export const handleNetworkQueryCancel = () => ({
  type: constant.HANDLE_NETWORK_QUERY_CANCEL
})
  
export const handleNetworkQuerySubmitData = (data) => ({
  type: constant.HANDLE_NEWORK_QUERY_SUBMIT,
  value: data
})

export const handleNetworkQuerySubmit = (form, values, editShow) => {
  // values.networks = values.networks.replace(/\n/g, " ")
  values.tcp_query_ports = values.tcp_query_ports.replace(/\n/g, ",")
  values.udp_query_ports = values.udp_query_ports.replace(/\n/g, ",")
  if(!editShow){
    return (dispatch) => {
      http.post('/api/network_query/add_network_query/', values)
        .then((res) => {
          res["form"] = form
          dispatch(handleNetworkQuerySubmitData(res)) 
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }else{
    return (dispatch) => {
      http.put('/api/network_query/add_network_query/', values)
        .then((res) => {
          res["form"] = form
          dispatch(handleNetworkQuerySubmitData(res)) 
      })
      .catch(function (error) {
      console.log(error);
      });
    }
  }
  }

export const handleGetAllNetworkQueryInfo = (data) => ({
  type: constant.HANDLE_GET_ALL_NETWORK_QUERY_INFO,
  value: data
})

export const getAllNetworkQueryInfo = (currentPage, pageSize) => {
  return (dispatch) => {
    http.get(`/api/network_query/get_network_query_info/?current_page=${currentPage}&page_size=${pageSize}`)
    .then((res) => {
      // res["current_page"] = currentPage
      dispatch(handleGetAllNetworkQueryInfo(res))
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}

export const handleDeleteNetworkQuery = (values) => {
  // 传递的values是一个数组类型
  var delete_network_ids = new Object();
  delete_network_ids["ids"] = values
  return (dispatch) => {
    http.post('/api/network_query/del_network_query/', delete_network_ids)
      .then((res) => {
        dispatch(handleNetworkQuerySubmitData(res)) //删除设备探测后，需要刷新页面
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const handleStartNetworkQuery = (values) => {
  // 传递的values是一个数组类型
  var delete_network_ids = new Object();
  delete_network_ids["ids"] = values
  return (dispatch) => {
    http.post('/api/network_query/add_network_query_to_cache/', delete_network_ids)
      .then((res) => {
        dispatch(handleNetworkQuerySubmitData(res)) //删除设备探测后，需要刷新页面
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const getNetworkDetails = (data) => ({
  type: constant.GET_NETWORK_DETAIL_INFO,
  value: data
})


export const getAllNetworkDetailsInfo = (id, pagination) => {
  var pageSize = pagination.pageSize
  var currentPage = pagination.current
  var ipStatusFilter = null
  var ipTypeFilter = null
  var columnKeySorter = null
  var orderSorter = null
  return (dispatch) => {
    http.get(`/api/network_query/get_network_details/?id=${id}&current_page=${currentPage}&page_size=${pageSize}&ip_status=${ipStatusFilter}&ip_type=${ipTypeFilter}&columnKey=${columnKeySorter}&order=${orderSorter}`)
      .then((res) => {
        res["page_size"] = pageSize
        res["current_page"] = currentPage
        dispatch(getNetworkDetails(res)) 
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}

export const handlePortDetail = (data) => ({
  type: constant.GET_NETWORK_PORT_DETAIL_INFO,
  value: data
})

export const getPortDetailInfo = (id) => {
  id = id.split("&")
  var protocol = id[0]
  var ip = id[1]
  return (dispatch) => {
    if(protocol === 'udp'){
      http.get('/api/network_query/get_udp_ports_details/' + ip + '/')
        .then((res) => {
        dispatch(handlePortDetail(res.result)) 
        })
        .catch(function (error) {
          console.log(error);
        });
    }
    else{
      http.get('/api/network_query/get_tcp_ports_details/' + ip + '/')
        .then((res) => {
          dispatch(handlePortDetail(res.result)) 
      })
        .catch(function (error) {
          console.log(error);
      });
    }
  }
}

export const handleNetworkQueryDetailsTableChange  = (pagination, filters, sorter, id) => {
  console.log(sorter)
  var pageSize = pagination.pageSize
  var currentPage = pagination.current
  var ipStatusFilter = filters.ip_status
  var ipTypeFilter = filters.ip_type
  var columnKeySorter = null
  var orderSorter = null
  if(sorter.hasOwnProperty('columnKey')){
    columnKeySorter = sorter.columnKey
    orderSorter = sorter.order
  }
  return (dispatch) => {
    http.get(`/api/network_query/get_network_details/?id=${id}&current_page=${currentPage}&page_size=${pageSize}&ip_status=${ipStatusFilter}&ip_type=${ipTypeFilter}&columnKey=${columnKeySorter}&order=${orderSorter}`)
      .then((res) => {
        res["page_size"] = pageSize
        res["current_page"] = currentPage
        dispatch(getNetworkDetails(res)) 
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}


export const handleConsoleCancel = () => ({
  type: constant.HANDLE_CONSOLE_CANCEL,
})

export const handleConsoleClick = (ipAddress) => ({
  type: constant.HANDLE_CONSOLE_CLICK,
  value: ipAddress
})

export const getConsoleSubmitInfo = (data) => ({
  type: constant.GET_CONSOLE_SUBMIT_INFO,
  value: data
})

export const setupConsoleSubmitClickStatus = (data) => ({
  type: constant.SETUP_CONSOLE_SUBMIT_STATUS,
  value: data
})

export const handleProtocolChange  = (data) => ({
  type: constant.HANDLE_PROTOCOL_CHANGE,
  value: data
})

export const handleConsoleInfoSubmit = (values) => {
  let data = new Object();
  data["status"] = true
  data["result"] = "登陆中......"
  return (dispatch) => {
    if(values.protocol === "telnet"){
      dispatch(getConsoleSubmitInfo(values))
    }
    if(values.protocol === "ssh"){
      dispatch(setupConsoleSubmitClickStatus(data))
      http.post('/api/device_query/check_user_password/', values)
        .then((res) => {
          console.log("values:", values)
          res["protocol"] = "ssh"
          dispatch(getConsoleSubmitInfo(res))
        })
        .catch(function (error) {
          data["status"] = false
          data["result"] = "未知错误"
          dispatch(setupConsoleSubmitClickStatus(data))
            console.log(error);
        });
      }
    }
  }

  export const hanleAutoNetworkQuerySwitch  = (data) => ({
    type: constant.HANDLE_AUTO_NETWORK_QUERY_SWITCH,
    value: data
  })

  export const handleModelChange  = (data) => ({
    type: constant.HANDLE_MODEL_CHANGE,
    value: data
  })

  export const handleAddField = () => ({
    type: constant.HANDLE_ADD_FIELD,
  })

  export const handleDeleteModel  = (index) => ({
    type: constant.HANDLE_DELETE_MODEL,
    value: index
  })

  export const handleEditNetworkQuery  = (data) => ({
    type: constant.HANDLE_EDIT_NETWORK_QUERY,
    value: data
  })

  export const selectGroupChange = (data) => {
    return (dispatch) => {
      http.get(`/api/network_query/get_groups_to_networks/?group=${data}`)
        .then((res) => {
          // console.log("res:", res.result.networks)
          dispatch({
            type: constant.HANDLE_SELECT_GROUP_CHANGE,
            value: res.result
          }) 
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }