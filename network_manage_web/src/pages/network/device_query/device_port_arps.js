import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Layout } from 'antd';
const { Content } = Layout;

const columns = [
  {
    title: '端口名称',
    dataIndex: 'port_name',
    key: 'port_name',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'MAC地址',
    dataIndex: 'mac',
    key: 'mac',
    width: 150,
    ellipsis: true,
  }
];

class DevicePortToARP extends Component{
  render(){
    const {PortToARP} = this.props
    return(
      <Content>
        <Table 
          columns={columns}
          dataSource={PortToARP} 
          bordered
          pagination ={false}
        />
      </Content>
    )
  }
  componentDidMount(){
    this.props.getDevicePortToARP(this.props.match.params.id);
  }
}

const mapState = (state) => ({
  PortToARP: state.getIn(['deviceQuery', 'PortToARP']),
})

const mapDispatch = (dispatch) =>({
  getDevicePortToARP(id){
    dispatch(actionCreators.getDevicePortToARP(id))
  },
  
  })

export default connect(mapState, mapDispatch)(DevicePortToARP)