import axios from "axios/index";
import * as constant from './actionTypes'
import  setting_config  from '../../../setting'

const server_ip = setting_config.service_ip

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

export const getConsoleSubmitInfo = (data) => ({
  type: constant.GET_CONSOLE_SUBMIT_INFO,
  value: data
})

export const setupConsoleSubmitClickStatus = (data) => ({
  type: constant.SETUP_CONSOLE_SUBMIT_STATUS,
  value: data
})

export const handleProtocolChange  = (data) => ({
  type: constant.HANDLEPROTOCOLCHANGE,
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
      axios.post(`http://${server_ip}/api/check_user_password/`, values)
        .then((res) => {
          res.data["protocol"] = "ssh"
          dispatch(getConsoleSubmitInfo(res.data))
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

export const getAllDeviceQueryInfo = (currentPage, pageSize) => {
  return (dispatch) => {
    const data=new Object();
    data["current_page"] = currentPage
    data["page_size"] = pageSize
    axios.post(`http://${server_ip}/api/get_device_query_info/`, data)
    .then((res) => {
      // console.log(res.data)
      dispatch(handleAllDeviceQueryInfo(res.data))
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
  // console.log("delete_ip_ids:", delete_ip_ids)
  return (dispatch) => {
    axios.post(`http://${server_ip}/api/del_device_query/`, delete_ip_ids)
      .then((res) => {
          dispatch(handleDeviceQuerySubmitData(res.data)) //删除设备探测后，出发刷新页面
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
  // console.log("delete_ip_ids:", delete_ip_ids)
  return (dispatch) => {
    axios.post(`http://${server_ip}/api/add_device_query_to_cache/`, ids)
      .then((res) => {
          dispatch(handleDeviceQuerySubmitData(res.data)) //删除设备探测后，出发刷新页面
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}

export const getDeviceQuerySubmit = (values) => {
  values.device_ips = values.device_ips.replace(/\n/g, " ")
  return (dispatch) => {
    axios.post(`http://${server_ip}/api/add_device_query/`, values)
      .then((res) => {
        dispatch(handleDeviceQuerySubmitData(res.data)) 
    })
    .catch(function (error) {
    console.log(error);
    });
  }
}

export const getAllDeviceDetailsInfo = (id) => {
  return (dispatch) => {
    axios.get(`http://${server_ip}/api/get_device_details/` + id + '/')
      .then((res) => {
        dispatch(getDeviceDetails(res.data)) 
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
    axios.get(`http://${server_ip}/api/device_port_macs/` + id + '/')
      .then((res) => {
        dispatch(handleDevicePortToMAC(res.data.result)) 
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const handleDevicePortToARP = (data) => ({
  type: constant.GET_DEVICE_PORT_ARP,
  value: data
})
export const getDevicePortToARP = (id) => {
  return (dispatch) => {
    axios.get(`http://${server_ip}/api/device_port_arp/` + id + '/')
      .then((res) => {
        // console.log(id, res)
        dispatch(handleDevicePortToARP(res.data.result)) 
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}




