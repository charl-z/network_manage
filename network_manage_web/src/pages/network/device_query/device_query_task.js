import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Button, Input,  Pagination, Layout, Space, Row, Col } from 'antd';
import BuildDiviceQueryForm from './BuildDeviceQueryFrom'
import GroupManage from '../group_manage/'
import ConsoleForm from './ConsoleForm'
import {weeks_obj} from '../../../libs/constant'

const { Content } = Layout;

class DeviceQueryList extends Component{
  render(){
    const {
      selectedRowKeys, 
      deviceQueryInfos, 
      totalDeivces,
      deviceQueryPageSize,
      deviceQueryCurrentPage,
        } = this.props;

    const columns = [
      {
        title: '探测设备IP',
        dataIndex: 'ip_address',
        key: 'ip_address',
        render: (text, record) => <Link to={'/network/device_details/'+text}>{text}</Link> //record是对象
      },
      {
        title: '探测设备名称',
        dataIndex: 'device_name',
        key: 'device_name',
      },
      {
        title: '设备厂商',
        dataIndex: 'device_company',
        key: 'device_company',
      },
      {
        title: '状态',
        dataIndex: 'query_status',
        key: 'query_status',
      },
      {
        title: 'SNMP端口',
        dataIndex: 'snmp_port',
        key: 'snmp_port',
      },
      {
        title: 'SNMP团体名',
        dataIndex: 'snmp_community',
        key: 'snmp_community',
      },
      {
        title: '最新探测时间',
        dataIndex: 'query_time',
        key: 'query_time',
      },
      {
        title: '远程登陆',
        dataIndex: 'ssh',
        key: 'ssh',
        render: (text, record) => 
        <Fragment>
          <Space>
            <Button onClick={() => this.props.handleEditDeviceQuery(record)}>编辑</Button>
            <Button  danger onClick={() => this.props.handleDeleteDeviceQuery(record.key)}>删除</Button>
            <Button type='primary' onClick={() => this.props.handleConsoleClick(record.ip_address)}>Console</Button>
          </Space>
        </Fragment>
         //record是对象
      },
      {
        title: '定时任务',
        dataIndex: 'crontab_task',
        key: 'crontab_task',
        ellipsis: true,
        width: 150,
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
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    
  return(
          <Fragment>
           <div style={{marginTop: '10px', marginLeft: '10px', marginBottom: '10px'}}>
              <Button style={{ marginLeft: '10px' }} type='primary' onClick={this.props.handleNewBuildDeviceQuery}>新建</Button>
              {
                selectedRowKeys.length !== 0 ? 
                <Fragment>
                  <Button  style={{ marginLeft: '10px' }}>编辑</Button>
                  <Button  style={{ marginLeft: '10px' }} onClick={ () => this.props.handleDeleteDeviceQuery(selectedRowKeys)}>删除</Button>
                  <Button  style={{ marginLeft: '10px' }} onClick={ () => this.props.handleStartDeviceQuery(selectedRowKeys)}>启动</Button>
                </Fragment>
                :
                <Fragment>
                  <Button disabled style={{ marginLeft: '10px' }}>编辑</Button>
                  <Button disabled style={{ marginLeft: '10px' }}>删除</Button>
                  <Button  disabled style={{ marginLeft: '10px' }} >启动</Button>
                </Fragment>
              }
               <Button style={{ marginLeft: '10px' }} type='primary' onClick={() => this.props.getAllDeviceQueryInfo(deviceQueryCurrentPage, deviceQueryPageSize)}>刷新</Button>
               <Input.Search
                placeholder="输入需要搜索IP"
                enterButton="搜索"
                
                onSearch={value => this.props.handleDeviceQuerySearch(value, deviceQueryCurrentPage, deviceQueryPageSize)}
                style={{ marginLeft: '20px', width: 200, }}
              />
          </div>
          {
            this.props.newBuiltDeviceVisible && <BuildDiviceQueryForm/> //通过newBuiltDeviceVisible得值得变化，重新加载组件
          }
          {
            this.props.consonleLoginVisible && <ConsoleForm />
          }
          
          <Table 
            rowSelection={rowSelection} 
            columns={columns}
            dataSource={deviceQueryInfos} 
            tableLayout='auto'
            bordered
            pagination={false}
          />
          <br/>
          <div style={{marginTop: '10px', marginBottom: '10px' }}>
            <Pagination 
            showSizeChanger   
            defaultCurrent={deviceQueryCurrentPage} 
            defaultPageSize={deviceQueryPageSize}
            total={ totalDeivces }
            showTotal={total => `总共${total}条`}
            onShowSizeChange={this.props.handlePageSizeChange}  
            onChange={this.props.handlePageChange}
            pageSizeOptions={['30', '50', '100']}
            />
          </div>
         </Fragment> 
      )
    }
  componentWillReceiveProps(prevProps) {
    if(prevProps.checkDeviceQueryInputIps){
      this.props.getAllDeviceQueryInfo(this.props.deviceQueryCurrentPage, this.props.deviceQueryPageSize);
      }
    };
  onSelectChange = (ids) => {
    this.props.getSelectQuery(ids)
    };
  
  componentDidMount(){
    this.props.getAllDeviceQueryInfo(this.props.deviceQueryCurrentPage, this.props.deviceQueryPageSize);
  }
}

const mapState = (state) => ({
  selectedRowKeys: state.getIn(['deviceQuery', 'selectedRowKeys']),
  deviceQueryInfos: state.getIn(['deviceQuery', 'deviceQueryInfos']),
  newBuiltDeviceVisible: state.getIn(['deviceQuery', 'newBuiltDeviceVisible']),
  checkDeviceQueryInputIps: state.getIn(['deviceQuery', 'checkDeviceQueryInputIps']),
  getCheckDeviceQueryInputIpsInfo: state.getIn(['deviceQuery', 'getCheckDeviceQueryInputIpsInfo']),
  totalDeivces: state.getIn(['deviceQuery', 'totalDeivces']),
  deviceQueryCurrentPage: state.getIn(['deviceQuery', 'deviceQueryCurrentPage']),
  deviceQueryPageSize: state.getIn(['deviceQuery', 'deviceQueryPageSize']),
  consoleHostInfo: state.getIn(['deviceQuery', 'consoleHostInfo']),
  DeivceQueryCron: state.getIn(['deviceQuery', 'DeivceQueryCron']),
  showDeivceQueryCron: state.getIn(['deviceQuery', 'showDeivceQueryCron']),
  SelectTimeList: state.getIn(['deviceQuery', 'SelectTimeList']),
  consonleLoginVisible: state.getIn(['deviceQuery', 'consonleLoginVisible']),
})

const mapDispatch = (dispatch) =>({
  getSelectQuery(selectedRowKeys){
    // console.log("selectedRowKeys：", selectedRowKeys)
    dispatch(actionCreators.getSelectQuery(selectedRowKeys))
  },
  getAllDeviceQueryInfo(currentPage, pageSize){
    dispatch(actionCreators.getAllDeviceQueryInfo(currentPage, pageSize))
  },
  handleNewBuildDeviceQuery(){
    dispatch(actionCreators.handleNewBuildDeviceQuery())
  },
  handleDeleteDeviceQuery(values){
    // console.log(values)
    dispatch(actionCreators.handleDeleteDeviceQuery(values))
    },
  handleStartDeviceQuery(values){
    dispatch(actionCreators.handleStartDeviceQuery(values))
  },
  handlePageChange(pageNumber, pageSize) {
      dispatch(actionCreators.getAllDeviceQueryInfo( pageNumber, pageSize))
  },
  handlePageSizeChange(current, pageSize){
    if(current===0){
      current = 1
    }
    dispatch(actionCreators.getAllDeviceQueryInfo(current, pageSize))
  },
  handleConsoleClick(ipAddress){
    dispatch(actionCreators.handleConsoleClick(ipAddress))
  },
  handleEditDeviceQuery(record){
    if(record['auto_enable']){
      record['auto_enable'] = "on"
    }else{
      record['auto_enable'] = "off"
    }
    // console.log("record:", record)
    dispatch(actionCreators.handleEditDeviceQuery(record))
    
  },
  handleDeviceQuerySearch(value, currentPage, pageSize){
    // console.log(value, pageNumber, pageSize)
    // var pageNumber = 1
    dispatch(actionCreators.handleDeviceQuerySearch(value, currentPage, pageSize))
  },

  })

export default connect(mapState, mapDispatch)(DeviceQueryList)