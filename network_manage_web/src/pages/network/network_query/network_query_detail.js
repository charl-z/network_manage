import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Layout,BackTop } from 'antd';
const { Content } = Layout;

const columns = [
  {
    title: '网络地址',
    dataIndex: 'network',
    key: 'network',
    width: 100,
    ellipsis: true,
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 100,
    sorter: true,
    ellipsis: true,
  },
  {
    title: 'IP地址状态',
    dataIndex: 'ip_status',
    key: 'ip_status',
    filters: [
      { text: '在线', value: '1' },
      { text: '离线', value: '0' },
    ],
    width: 100,
    ellipsis: true,
  },
  {
    title: '扫描MAC地址',
    dataIndex: 'scan_mac_address',
    key: 'scan_mac_address',
    width: 120,
    ellipsis: true,
  },
  {
    title: '扫描MAC地址厂商',
    dataIndex: 'scan_mac_product',
    key: 'scan_mac_product',
    width: 120,
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
      { text: '未使用', value: '2' },
    ],
  },
  {
    title: '主机名',
    dataIndex: 'hostname',
    key: 'hostname',
    width: 100,
  },
  {
    title: 'TCP扫描端口',
    dataIndex: 'tcp_port_list',
    key: 'tcp_port_list',
    width: 120,
    ellipsis: true,
    render (text, record) {
      var value = []
      if(text !== ''){
        value = JSON.parse(text)
      }
      if(value.length >= 2){
        return (
          <Link to={'/network/network_details/tcp_port_list/tcp&'+record.ip}>{value.join("\n")}</Link>
        )
      }
      else{
        return(
          <div>{value.join(",")}</div>
        )
      }
    }
  },
  {
    title: 'UDP扫描端口',
    dataIndex: 'udp_port_list',
    key: 'udp_port_list',
    width: 120,
    ellipsis: true,
    render (text, record) {
      var value = []
      if(text !== ''){
        value = JSON.parse(text)
      }
      if(value.length >= 2){
        return (
          <Link to={'/network/network_details/udp_port_list/udp&'+record.ip}>{value.join("\n")}</Link>
        )
      }
      else{
        return(
          <div>{value.join(",")}</div>
        )
      }
    }
  },
  {
    title: '扫描时间',
    dataIndex: 'query_time',
    key: 'query_time',
    width: 200,
  },
];

const style = {
  height: 40,
  width: 40,
  lineHeight: '40px',
  borderRadius: 4,
  backgroundColor: '#1088e9',
  color: '#fff',
  textAlign: 'center',
  fontSize: 14,
};
const pageSizeOptions = [30, 100, 500]
class NetworkQueryDetail extends Component{
  render(){
    const { NetworkQueryDetailInfos,  NetworkQueryDetailsPagination} = this.props
    NetworkQueryDetailsPagination["pageSizeOptions"] = pageSizeOptions
    NetworkQueryDetailsPagination["showTotal"] = () => `总共${NetworkQueryDetailsPagination.total}条`

    return(
      <Fragment>
      <Content>
        <Table 
          columns={columns}
          dataSource={NetworkQueryDetailInfos} 
          bordered
          pagination={ NetworkQueryDetailsPagination }
          onChange={(pagination, filters, sorter) => this.props.handleNetworkQueryDetailsTableChange(pagination, filters, sorter, this.props.match.params.id)}
        />
      </Content>
     
     
      
      </Fragment>
    )
  }
  componentDidMount(){
    this.props.getAllNetworkDetailsInfo(this.props.match.params.id);
  }
}

const mapState = (state) => ({
  NetworkQueryDetailInfos: state.getIn(['networkQuery', 'NetworkQueryDetailInfos']),
  NetworkQueryDetailsPagination: state.getIn(['networkQuery', 'NetworkQueryDetailsPagination']).toObject(),
})

const mapDispatch = (dispatch) =>({
  getAllNetworkDetailsInfo(id){
    var NetworkQueryDetailsPagination = {
      "pageSize": pageSizeOptions[0],
      "current": 1
    }
    dispatch(actionCreators.getAllNetworkDetailsInfo(id, NetworkQueryDetailsPagination))
  },
  handleNetworkQueryDetailsTableChange(pagination, filters, sorter, id){
    dispatch(actionCreators.handleNetworkQueryDetailsTableChange(pagination, filters, sorter, id))
  },
  
  })

export default connect(mapState, mapDispatch)(NetworkQueryDetail)