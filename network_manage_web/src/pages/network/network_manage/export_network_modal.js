import React from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import {Modal, Button, Space, Divider} from 'antd';
import { CSVLink } from "react-csv";

const headers = [
  { label: "网络地址", key: "network" },
  { label: "分组名称", key: "group_name" },
  { label: "探测设备名称", key: "device_name" },
  { label: "探测设备IP", key: "device_ip" },
  { label: "设备端口", key: "device_interface" },
  { label: "地址数量", key: "total_ips" },
];
 
const ExportNetwork = (props) => {
  const {exportNetworkModalVisible, selectGroupName, exportNetworkData} = props
  console.log("exportNetworkData:", exportNetworkData)
  return(
    <Modal
      title='导入网络'
      visible={exportNetworkModalVisible}
      footer={null}
      onCancel={props.exportNetworkMoadlCancel}
    >
      <p>确认导出网络信息吗？</p>
      <Divider />
      <Space style={{ marginLeft: '350px' }}>
        <Button onClick={props.exportNetworkMoadlCancel}>取消</Button>
        <CSVLink 
            data={exportNetworkData} 
            headers={headers}
            filename={"网络.csv"}
        >
          <Button type='primary' onClick={() => props.exportNetworksOk(selectGroupName)}>导出</Button>
        </CSVLink>
      </Space>
  </Modal>
  )
}

const mapState = (state) => ({
  exportNetworkModalVisible: state.getIn(['networkManage', 'exportNetworkModalVisible']),
  selectedRowKeys: state.getIn(['networkManage', 'selectedRowKeys']),
  exportNetworkData: state.getIn(['networkManage', 'exportNetworkData']),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
})

const mapDispatch = (dispatch) =>({
  exportNetworkMoadlCancel(){
    dispatch(actionCreators.exportNetworkMoadlCancel())
    },
    exportNetworksOk(selectGroupName){
    dispatch(actionCreators.getAllNetworksInfo(selectGroupName))
  },
  })
export default connect(mapState, mapDispatch)(ExportNetwork)