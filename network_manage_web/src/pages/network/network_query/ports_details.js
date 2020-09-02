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

class PortDetail extends Component{
  render(){
    const {PortDetailInfos} = this.props
    console.log(PortDetailInfos)
    return(
      <Content>
        <Table 
          columns={columns}
          dataSource={PortDetailInfos} 
          bordered
          pagination ={false}
        />
      </Content>
    )
  }
  componentDidMount(){
    // console.log(this.props.match.params.id)
    this.props.getPortDetailInfo(this.props.match.params.id);
  }
}

const mapState = (state) => ({
  PortDetailInfos: state.getIn(['networkQuery', 'PortDetailInfos']),
})

const mapDispatch = (dispatch) =>({
  getPortDetailInfo(id){
    dispatch(actionCreators.getPortDetailInfo(id))
      },
  })

export default connect(mapState, mapDispatch)(PortDetail)