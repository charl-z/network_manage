import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Button, Tooltip,  Pagination, Layout, Space, Row, Col  } from 'antd';
import GroupManage from '../group_manage'
import DeleteNetwork from './delete_network_modal'
import NetworkManageForm from './build_networks_form'
import ExportNetwork from './export_network_modal'
import ImportNetwork from './import_network_modal'


class NetworkManage extends Component{
  render(){
    const columns = [
      {
        title: '网络地址',
        dataIndex: 'network',
        key: 'network',
        ellipsis: true,
        render: (text, record) => <Link to={'/network/network_manage/'+record.key.replace("/", "$")}>{text}</Link> //record是对象
      },
      {
        title: '分组名称',
        dataIndex: 'group_name',
        key: 'group_name',
        ellipsis: true,
      },
      {
        title: '探测设备名称',
        dataIndex: 'device_name',
        key: 'device_name',
        ellipsis: true,
        render (text, record) {
          var value = []
          if(text !== ''){
            value = JSON.parse(text) //将text的列表字符串转化为列表
          }
          return <div>{value.join("\n")}</div>
        }
      },
      {
        title: '探测设备IP',
        dataIndex: 'device_ip',
        key: 'device_ip',
        ellipsis: true,
        render (text, record) {
          var value = []
          if(text !== ''){
            value = JSON.parse(text) //将text的列表字符串转化为列表
          }
          return(
          <Space>
            {
              value.map(
                (item, index) => {
                  return <Link key={index} to={'/network/device_details/'+item}>{item + " "}</Link>
                } 
              )
            }
          </Space>
          )
        }
      },
      {
        title: '设备端口',
        dataIndex: 'device_interface',
        key: 'device_interface',
        ellipsis: true,
        render (text, record) {
          var value = []
          if(text !== ''){
            value = JSON.parse(text) //将text的列表字符串转化为列表
          }
          return <div>{value.join("\n")}</div>
        }
      },
      {
        title: '地址数量',
        dataIndex: 'total_ips',
        key: 'total_ips',
        width: 100
      },
    ];

  const { 
    BuildNetworksVisible,
    networInfos,
    selectedRowKeys,
    deleteNetworkModalVisible,
    exportNetworkModalVisible,
    importNetworkModalVisible
  } = this.props
  // console.log("selectedRowKeys:", selectedRowKeys)
  const rowSelection = {
    selectedRowKeys,
    onChange: this.onSelectChange,
  };

  return(
    <Row>
      <Col span={3}>
          <GroupManage />
        </Col>
        <Col span={21}>
        <Space>
          <Button style={{ marginLeft: '10px' }} type='primary' onClick={this.props.handleBuildNetworks}>新建</Button>
          {
            selectedRowKeys.length === 0 ?
            <Button type='primary' disabled>删除</Button>
              :
            <Button type='primary' onClick={() => this.props.handleDeleteNetworks(selectedRowKeys)}>删除</Button>
          }
            <Button type='primary' onClick={this.props.handleImportNetworks}>批量导入</Button>
            <Button type='primary' onClick={() => this.props.handleExportNetworks(selectedRowKeys)}>导出</Button>
          </Space>
          
          <Table 
            rowSelection={rowSelection} 
            columns={columns}
            dataSource={networInfos} 
            tableLayout='auto'
            bordered
            pagination={false}
          />
          {
            BuildNetworksVisible && <NetworkManageForm/>
          }
          {
            deleteNetworkModalVisible && <DeleteNetwork/>
          }
          {
            exportNetworkModalVisible && <ExportNetwork/>
          }
          {
            importNetworkModalVisible && <ImportNetwork/>
          }
        </Col>
      </Row>
    )
  }
  componentDidMount(){
    this.props.getAllNetworksInfo(this.props.selectGroupName)
  }
  componentWillReceiveProps(prevProps) {
    if(this.props.selectGroupName !== prevProps.selectGroupName){
      this.props.getAllNetworksInfo(prevProps.selectGroupName)
    }
  }
  onSelectChange = selectedRowKeys => {
    this.props.handleNetworksSelected(selectedRowKeys)
    };
}

const mapState = (state) => ({
  BuildNetworksVisible: state.getIn(['networkManage', 'BuildNetworksVisible']),
  networInfos: state.getIn(['networkManage', 'networInfos']),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
  selectedRowKeys: state.getIn(['networkManage', 'selectedRowKeys']),
  deleteNetworkModalVisible: state.getIn(['networkManage', 'deleteNetworkModalVisible']),
  exportNetworkModalVisible: state.getIn(['networkManage', 'exportNetworkModalVisible']),
  importNetworkModalVisible: state.getIn(['networkManage', 'importNetworkModalVisible']),
})

const mapDispatch = (dispatch) =>({
  handleBuildNetworks(){
    dispatch(actionCreators.handleBuildNetworks())
  },
  getAllNetworksInfo(selectGroup){
    dispatch(actionCreators.getAllNetworksInfo(selectGroup)) 
  },
  handleDeleteNetworks(){
    dispatch(actionCreators.handleDeleteNetworks()) 
  },
  handleNetworksSelected(selectedRowKeys){
    dispatch(actionCreators.handleNetworksSelected(selectedRowKeys)) 
  },
  handleImportNetworks(){
    dispatch(actionCreators.handleImportNetwork()) 
  },
  handleExportNetworks(selectedRowKeys){
    dispatch(actionCreators.handleExportNetworks(selectedRowKeys)) 
  },
  })

export default connect(mapState, mapDispatch)(NetworkManage)