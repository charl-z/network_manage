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
    title: 'MAC地址',
    dataIndex: 'mac',
    key: 'mac',
    width: 150,
    ellipsis: true,
  }
];

class DevicePortToMAC extends Component{
  render(){
    const {PortToMAC} = this.props
    return(
      <Content>
        <Table 
          columns={columns}
          dataSource={PortToMAC} 
          bordered
          pagination ={false}
        />
      </Content>
    )
  }
  componentDidMount(){
    this.props.getDevicePortToMAC(this.props.match.params.id);
  }
}

const mapState = (state) => ({
  PortToMAC: state.getIn(['deviceQuery', 'PortToMAC']),
})

const mapDispatch = (dispatch) =>({
  getDevicePortToMAC(id){
    dispatch(actionCreators.getDevicePortToMAC(id))
      },
  })

export default connect(mapState, mapDispatch)(DevicePortToMAC)