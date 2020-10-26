import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Button, Space, Tooltip } from 'antd';
import EditIpDetailModal from './edit_ip_detail_modal'
import { PAGE_SIZE_OPTION } from '../../../libs/functools'


// const pageSizeOptions = [30, 100, 500]

class IpDetails extends Component{
  render(){
    const columns = [
      {
        title: '网络地址',
        dataIndex: 'network',
        key: 'network',
        width: 120,
        ellipsis: true,
        fixed: 'left',
      },
      {
        title: 'IP地址',
        dataIndex: 'ip',
        key: 'ip',
        width: 120,
        sorter: true,
        ellipsis: true,
        fixed: 'left',
      },
      {
        title: 'IP地址状态',
        dataIndex: 'ip_status',
        key: 'ip_status',
        filters: [
          { text: '在线', value: '1' },
          { text: '离线', value: '0' },
        ],
        width: 120,
        ellipsis: true,
      },
      {
        title: '扫描MAC',
        dataIndex: 'query_mac',
        key: 'query_mac',
        width: 150,
        ellipsis: true,
      },
      {
        title: '扫描MAC厂商',
        dataIndex: 'query_mac_product',
        key: 'query_mac_product',
        width: 150,
        ellipsis: true,
      },
      {
        title: '手动MAC',
        dataIndex: 'manual_mac',
        key: 'manual_mac',
        width: 150,
        ellipsis: true,
      },
      {
        title: '手动MAC厂商',
        dataIndex: 'manual_mac_product',
        key: 'manual_mac_product',
        width: 150,
        ellipsis: true,
      },
      {
        title: '类型',
        dataIndex: 'ip_type',
        key: 'ip_type',
        width: 100,
        filters: [
          { text: '未管理', value: '0' },
          { text: '手动地址', value: '1' },
          { text: '冲突地址', value: '2' },
        ],
        render (text, record) {
          if(text === '冲突地址'){
            return(<div style={{backgroundColor:'#DC143C'}}>{text}</div>)
          }else if(text === '手动地址'){
            return(<div style={{backgroundColor:'#3CB371'}}>{text}</div>)    
          }else{
            return(<div>{text}</div>)
          }

        }
      },
      {
        title: '扫描设备接口',
        dataIndex: 'device_hostname_interface',
        key: 'device_hostname_interface',
        width: 250,
        ellipsis: true,
        render (text, record) {
          if(text){
            return(<div>{text.join("\n")}</div>)
          }
        }
      },
      {
        title: 'TCP扫描端口',
        dataIndex: 'tcp_port_list',
        key: 'tcp_port_list',
        width: 250,
        ellipsis: true,
        render (text, record) {
          if(text !== ''){
            if(text.length >= 2){
              return (
                <Link to={'/network/network_details/tcp_port_list/tcp&'+record.ip}>{text.join("\n")}</Link>
              )
            }
            else{
              return(
                <div>{text.join(",")}</div>
              )
            }
          }
        }
      },
      {
        title: 'UDP扫描端口',
        dataIndex: 'udp_port_list',
        key: 'udp_port_list',
        width: 250,
        ellipsis: true,
        render (text, record) {
          if(text !== ''){
            if(text.length >= 2){
              return (
                <Link to={'/network/network_details/udp_port_list/udp&'+record.ip}>{text.join("\n")}</Link>
              )
            }
            else{
              return(
                <div>{text.join(",")}</div>
              )
            }
          }
        }
      },
      {
        title: '主机名',
        dataIndex: 'hostname',
        key: 'hostname',
        ellipsis: true,
        width: 100,
      },
      {
        title: '远程登陆',
        dataIndex: 'ssh',
        key: 'ssh',
        width: 200,
        render: (text, record) => 
        <Fragment>
          <Space>
            <Button>编辑</Button>
            <Button type='primary'>Console</Button>
          </Space>
        </Fragment>
      },
      {
        title: '活跃时间',
        dataIndex: 'query_time',
        key: 'query_time',
        width: 200,
      },
    ];

    const { 
      ipDetailInfos, 
      iPDetailsPagination, 
      ipDetailSelectedRows, 
      EditIpDetailModalVisible, 
      isResolveConflict,
      isConvertToManual
    } = this.props
    console.log("isConvertToManual:", isConvertToManual)
    const rowSelection = {
      onSelect: this.onSelect,
    };

    iPDetailsPagination["showTotal"] = () => `总共${iPDetailsPagination.total}条`
    return(
      <Fragment>
        <Space style={{marginBottom: '5px', marginLeft: '10px'}}>
          {
            ipDetailSelectedRows.length === 1 ?
            <Button type='primary' onClick={this.props.handleEidtIpDetail}>编辑</Button>
              :
            <Fragment>
              <Button disabled>编辑</Button>
            </Fragment>
          }
          <Tooltip title="只会删除收到配置的MAC">
            <Button disabled>删除</Button>
          </Tooltip>
          {
            isConvertToManual ?
            <Button type='primary'>转手动</Button>
            :
            <Button disabled>转手动</Button>
          }
          {
            isResolveConflict ? 
            <Button type='primary' onClick={this.props.ResolveConflict}>解决冲突</Button>
            :
            <Button disabled>解决冲突</Button>
          }
          
        </Space>
        <Table 
        rowSelection={rowSelection}
          columns={columns}
          dataSource={ipDetailInfos} 
          bordered
          scroll={{ x: 1500, y: 7000 }}
          pagination={ iPDetailsPagination }
          onChange={(pagination, filters, sorter) => this.props.handleIpDetailsTableChange(pagination, filters, sorter, this.props.match.params.id)}
        />
        { EditIpDetailModalVisible && <EditIpDetailModal/>}
      </Fragment>
    )
  }
  componentDidMount(){
    this.props.getNetworkIpDetailsInfo(this.props.match.params.id);
  }

  componentWillReceiveProps(prevProps) {
    if(this.props.freshFlag !== prevProps.freshFlag){
      this.props.getNetworkIpDetailsInfo(this.props.match.params.id);
      }
    };
  
  onSelect = (record, selected, selectedRows, nativeEvent) => {
    this.props.handleIpDetailSelected(selectedRows)
  }
}

const mapState = (state) => ({
  ipDetailInfos: state.getIn(['networkManage', 'ipDetailInfos']),
  iPDetailsPagination: state.getIn(['networkManage', 'iPDetailsPagination']).toObject(),
  ipDetailSelectedRows: state.getIn(['networkManage', 'ipDetailSelectedRows']),
  EditIpDetailModalVisible: state.getIn(['networkManage', 'EditIpDetailModalVisible']),
  freshFlag: state.getIn(['networkManage', 'freshFlag']),
  isResolveConflict: state.getIn(['networkManage', 'isResolveConflict']),
  isConvertToManual: state.getIn(['networkManage', 'isConvertToManual']),
})

const mapDispatch = (dispatch) =>({
  getNetworkIpDetailsInfo(id){
    var NetworkQueryDetailsPagination = {
      "pageSize": PAGE_SIZE_OPTION[0],
      "current": 1
    }
      dispatch(actionCreators.getNetworkIpDetailsInfo(id, NetworkQueryDetailsPagination))
    },
  handleIpDetailsTableChange(pagination, filters, sorter, id){
    console.log(pagination, filters, sorter, id)
     dispatch(actionCreators.handleIpDetailsTableChange(pagination, filters, sorter, id))
    },
  handleIpDetailSelected(selectedRows){
    dispatch(actionCreators.handleIpDetailSelected(selectedRows))
    },
  handleEidtIpDetail(){
    dispatch(actionCreators.handleEidtIpDetail())
    },
  ResolveConflict(){

    }
  })

export default connect(mapState, mapDispatch)(IpDetails)