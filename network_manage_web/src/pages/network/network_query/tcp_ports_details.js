import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Layout } from 'antd';
const { Content } = Layout;

const columns = [
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 150,
    ellipsis: true,
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port',
    width: 150,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 150,
    ellipsis: true,
  },
  {
    title: '协议',
    dataIndex: 'protocol',
    key: 'protocol',
    width: 150,
    ellipsis: true,
  }

];

class TCPPortDetail extends Component{
  render(){
    const {TcpPortDetailInfos} = this.props
    return(
      <Content>
        <Table 
          columns={columns}
          dataSource={TcpPortDetailInfos} 
          bordered
          pagination ={false}
        />
      </Content>
    )
  }
  componentDidMount(){
    this.props.getTcpPortDetailInfo(this.props.match.params.id);
  }
}

const mapState = (state) => ({
  TcpPortDetailInfos: state.getIn(['networkQuery', 'TcpPortDetailInfos']),
})

const mapDispatch = (dispatch) =>({
  getTcpPortDetailInfo(id){
    dispatch(actionCreators.getTcpPortDetailInfo(id))
      },
  })

export default connect(mapState, mapDispatch)(TCPPortDetail)