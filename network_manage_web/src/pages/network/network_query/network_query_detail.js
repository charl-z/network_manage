import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Layout } from 'antd';
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
    dataIndex: 'ip_address',
    key: 'ip_address',
    width: 100,
    ellipsis: true,
  },
  {
    title: 'IP地址状态',
    dataIndex: 'ip_status',
    key: 'ip_status',
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
        // console.log(record)
        return (
          <Link to={'/network/network_details/tcp_port_list/'+record.ip}>{value.join("\n")}</Link>
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
        // console.log(value)
        return (
          <Link to={'/network/network_details/udp_port_list/'+record.ip}>{value.join("\n")}</Link>
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
class NetworkQueryDetail extends Component{
  render(){
    const { NetworkQueryDetailInfos } = this.props
    return(
      <Content>
        <Table 
          columns={columns}
          dataSource={NetworkQueryDetailInfos} 
          bordered
          pagination={{ pageSize: 30 }}
        />
      </Content>
    )
  }
  componentDidMount(){
    this.props.getAllNetworkDetailsInfo(this.props.match.params.id);
  }
}

const mapState = (state) => ({
  NetworkQueryDetailInfos: state.getIn(['networkQuery', 'NetworkQueryDetailInfos']),
})

const mapDispatch = (dispatch) =>({
  getAllNetworkDetailsInfo(id){
    dispatch(actionCreators.getAllNetworkDetailsInfo(id))
  },
  
  })

export default connect(mapState, mapDispatch)(NetworkQueryDetail)