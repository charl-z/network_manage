import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Button, Input,  Pagination, Layout, Space, Row, Col } from 'antd';
import BuildDiviceQueryForm from './build_network_query_modal'
import {weeks_obj} from '../../../libs/constant'
import GroupManage from '../group_manage'

class NetworkQueryList extends Component{
  render(){
    const columns = [
      {
        title: '网络地址',
        dataIndex: 'network',
        key: 'network',
        render: (text, record) => <Link to={'/network/network_manage/'+record.network.replace("/", "$")}>{text}</Link> //record是对象
      },
      {
        title: 'TCP探测端口',
        dataIndex: 'tcp_query_ports',
        key: 'tcp_query_ports',
      },
      {
        title: 'UDP探测端口',
        dataIndex: 'udp_query_ports',
        key: 'udp_query_ports',
      },
      {
        title: '状态',
        dataIndex: 'query_status',
        key: 'query_status',
      },
      {
        title: '在线地址数量',
        dataIndex: 'online_ip_num',
        key: 'online_ip_num',
      },
      {
        title: '最新探测时间',
        dataIndex: 'query_time',
        key: 'query_time',
      },
      {
        title: '任务处理',
        dataIndex: 'ssh',
        key: 'ssh',
        render: (text, record) => 
        <Fragment>
          <Space>
            <Button  type='primary' onClick={ () => this.props.handleStartNetworkQuery(record.key)}>启动</Button>
            <Button  type='primary' onClick={() => this.props.handleEditNetworkQuery(record)}>编辑</Button>
            <Button  danger onClick={() => this.props.handleDeleteNetworkQuery(record.key)}>删除</Button>
          </Space>
        </Fragment>
      },
      {
        title: '定时任务',
        dataIndex: 'crontab_task',
        key: 'crontab_task',
        render (text, record) {
          var value= []
          var res = []
          if(text !== ''){
            value = JSON.parse(text) //将text的列表字符串转化为列表
            value.map((item, index) => {
              var temp = item.split(" ")
              if(temp[2] !== "*") {
                res.push("每月" + temp[2] + "号" + temp[1] + ":" + temp[0])
              }
              else if(temp[4] !== "*") {
                res.push("每周" + weeks_obj[temp[4]] + " " + temp[1] + ":" + temp[0])
              }
              else if(temp[1] !== "*") {
                res.push("每天" + temp[1] + ":" + temp[0])
              }
              else{
                res.push("每小时第" + temp[0] + "分")
              }
            })
          }
          return(
          <div>{res.join("\n")}</div>
          )
        }
      },
    ];

  const { 
    NetworkQueryCurrentPage,
    NetworkQueryPageSize,
    totalNetworks,
    networkQueryInfos,
    selectedRowKeys,
    selectGroupName
  } = this.props
  console.log("selectGroupName:", selectGroupName)
  const rowSelection = {
    selectedRowKeys,
    onChange: this.onSelectChange,
  };

  return(

    <Row>
      <Col span={3}>
        <GroupManage />
      </Col>
      <Col>
        <div style={{marginTop: '10px', marginLeft: '10px', marginBottom: '10px'}}>
          <Button style={{ marginLeft: '10px' }} type='primary' onClick={() => this.props.handleBuildNetworkQuery(selectGroupName)}>新建</Button>
          {
            selectedRowKeys.length !== 0 ? 
            <Fragment>
              <Button  style={{ marginLeft: '10px' }} onClick={ () => this.props.handleDeleteNetworkQuery(selectedRowKeys)}>删除</Button>
              <Button  style={{ marginLeft: '10px' }} onClick={ () => this.props.handleStartNetworkQuery(selectedRowKeys)}>启动</Button>
            </Fragment>
            :
            <Fragment>
              <Button disabled style={{ marginLeft: '10px' }}>编辑</Button>
              <Button  disabled style={{ marginLeft: '10px' }} >启动</Button>
            </Fragment>
          }
          <Input.Search
            placeholder="输入需要搜索IP"
            enterButton="搜索"
            style={{ marginLeft: '20px', width: 200, }}
          />
        </div>
        {
          this.props.BuildNetworkQueryVisible && <BuildDiviceQueryForm/> //通过newBuiltDeviceVisible得值得变化，重新加载组件
        }
        <Table 
          rowSelection={rowSelection} 
          columns={columns}
          dataSource={networkQueryInfos} 
          tableLayout='auto'
          bordered
          pagination={false}
        />
        <br/>
        <div style={{marginTop: '10px', marginBottom: '10px' }}>
          <Pagination 
          showSizeChanger   
          defaultCurrent={ NetworkQueryCurrentPage } 
          defaultPageSize={ NetworkQueryPageSize } 
          total={ totalNetworks }
          showTotal={total => `总共${total}条`}
          onShowSizeChange={this.props.handlePageSizeChange}  
          onChange={this.props.handlePageChange}
          pageSizeOptions={['30', '50', '100']}
          />
        </div>
      </Col>
    </Row>
      
      )
    }
    componentWillReceiveProps(prevProps) {
      if(prevProps.checkNetworkQueryInputIps){
        this.props.getAllNetworkQueryInfo(this.props.NetworkQueryCurrentPage, this.props.NetworkQueryPageSize);
        }
      };
    componentDidMount(){
      this.props.getAllNetworkQueryInfo(this.props.NetworkQueryCurrentPage, this.props.NetworkQueryPageSize);
    }
    onSelectChange = (ids) => {
      this.props.getSelectQuery(ids)
      };
 
}

const mapState = (state) => ({
  BuildNetworkQueryVisible: state.getIn(['networkQuery', 'BuildNetworkQueryVisible']),
  NetworkQueryCurrentPage: state.getIn(['networkQuery', 'NetworkQueryCurrentPage']),
  NetworkQueryPageSize: state.getIn(['networkQuery', 'NetworkQueryPageSize']),
  checkNetworkQueryInputIps: state.getIn(['networkQuery', 'checkNetworkQueryInputIps']),
  networkQueryInfos: state.getIn(['networkQuery', 'networkQueryInfos']),
  totalNetworks: state.getIn(['networkQuery', 'totalNetworks']),
  selectedRowKeys: state.getIn(['networkQuery', 'selectedRowKeys']),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
})

const mapDispatch = (dispatch) =>({
  handleBuildNetworkQuery(selectGroup){
    // console.log("selectGroup:", selectGroup)
    dispatch(actionCreators.handleBuildNetworkQuery(selectGroup))
  },
  getAllNetworkQueryInfo(CurrentPage, PageSize){
    dispatch(actionCreators.getAllNetworkQueryInfo(CurrentPage, PageSize))
  },
  getSelectQuery(selectedRowKeys){
    dispatch(actionCreators.getSelectQuery(selectedRowKeys))
  },
  handleDeleteNetworkQuery(selectedRowKeys){
    dispatch(actionCreators.handleDeleteNetworkQuery(selectedRowKeys))
  },
  handleStartNetworkQuery(selectedRowKeys){
    dispatch(actionCreators.handleStartNetworkQuery(selectedRowKeys))
  },
  handleEditNetworkQuery(record){
    if(record['auto_enable']){
      record['auto_enable'] = "on"
    }else{
      record['auto_enable'] = "off"
    }
    dispatch(actionCreators.handleEditNetworkQuery(record))
  },
  })

export default connect(mapState, mapDispatch)(NetworkQueryList)