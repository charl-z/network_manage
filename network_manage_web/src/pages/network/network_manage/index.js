import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Button, Tooltip,  Pagination, Layout, Space, Row, Col  } from 'antd';
import GroupManage from '../group_manage'
import NetworkManageForm from './build_networks_form'


const { Content } = Layout;

class NetworkManage extends Component{
  render(){
    const columns = [
      {
        title: '网络地址',
        dataIndex: 'network',
        key: 'network',
        ellipsis: true,
        // render: (text, record) => <Link to={'/network/network_details/'+record.key}>{text}</Link> //record是对象
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
                  return <Link key={index} to={'/network/device_details/'+item}>{item + "\n"}</Link>
                } 
              )
            }
          </Space>
          )
        }
      },
      {
        title: '交换机端口',
        dataIndex: 'device_interface',
        key: 'device_interface',
        ellipsis: true,
        render (text, record) {
          var value = []
          if(text !== ''){
            value = JSON.parse(text) //将text的列表字符串转化为列表
          }
          return(
            <div>
              {value.join("\n")}
            </div>
          )
          
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
    selectGroupName
  } = this.props

  // console.log("selectGroupName*********:", selectGroupName)
  const rowSelection = {
    // selectedRowKeys,
    // onChange: this.onSelectChange,
  };
  
  return(
    <Row>
      <Col span={3}>
          <GroupManage />
        </Col>
        <Col span={21}>
          <Space>
            <Button style={{ marginLeft: '10px' }} type='primary' onClick={this.props.handleBuildNetworks}>新建</Button>
            <Button type='primary'>编辑</Button>
            <Button type='primary'>删除</Button>
            <Button style={{ marginLeft: '20px' }} type='primary' >批量添加</Button>
            <Button type='primary'>导出</Button>
          </Space>
          <Table 
            rowSelection={rowSelection} 
            columns={columns}
            dataSource={networInfos} 
            // tableLayout='auto'
            bordered
            pagination={false}
          />
          {
            BuildNetworksVisible && <NetworkManageForm/>
          }
          
        </Col>
    </Row>
        
      
      )
    }
    componentWillReceiveProps(prevProps) {
      };
    componentDidMount(){
      this.props.getAllNetworksInfo(this.props.selectGroupName)
    }
    componentWillReceiveProps(prevProps) {
      if(this.props.selectGroupName !== prevProps.selectGroupName){
        this.props.getAllNetworksInfo(prevProps.selectGroupName)
      }
      
    }
    onSelectChange = (ids) => {
      };
 
}

const mapState = (state) => ({
  BuildNetworksVisible: state.getIn(['networkManage', 'BuildNetworksVisible']),
  networInfos: state.getIn(['networkManage', 'networInfos']),
  // groupToNetworks: state.getIn(['groupManage', 'groupToNetworks']),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
})

const mapDispatch = (dispatch) =>({
  handleBuildNetworks(){
    dispatch(actionCreators.handleBuildNetworks())
  },
  getAllNetworksInfo(selectGroup){
    dispatch(actionCreators.getAllNetworksInfo(selectGroup)) 
  }
  
  })

export default connect(mapState, mapDispatch)(NetworkManage)