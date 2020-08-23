import * as constant from './actionTypes'
import http from '../../../../libs/http';

export const handleBuildNetworkQuery = () => ({
    type: constant.HANDLE_NETWORK_QUERY_BUILD,
  })

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
export const handleNetworkQuerySubmit = (form, values) => {
  values.networks = values.networks.replace(/\n/g, " ")
  values.query_ports = values.query_ports.replace(/\n/g, ",")
  return (dispatch) => {
    http.post('/api/network_query/add_network_query/', values)
      .then((res) => {
        console.log("res:", res)
        res["form"] = form
        dispatch(handleNetworkQuerySubmitData(res)) 
    })
    .catch(function (error) {
      console.log(error);
    });
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

