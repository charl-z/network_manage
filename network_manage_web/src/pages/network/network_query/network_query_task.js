import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Button, Input,  Pagination, Layout, Space} from 'antd';
import BuildDiviceQueryForm from './BuildNetwrokQueryFrom'

const { Content } = Layout;

class NetworkQueryList extends Component{
  render(){
    const columns = [
      {
        title: '网络地址',
        dataIndex: 'network',
        key: 'network',
        // render: (text, record) => <Link to={'/network/device_details/'+record.key}>{text}</Link> //record是对象
      },
      {
        title: '探测端口',
        dataIndex: 'query_ports',
        key: 'query_ports',
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
        title: '定时任务',
        dataIndex: 'crontab_task',
        key: 'crontab_task',
      },
    ];

  const { 
    BuildNetworkQueryVisible,
    NetworkQueryCurrentPage,
    NetworkQueryPageSize,
    totalNetworks,
    networkQueryInfos,
    selectedRowKeys,
  } = this.props

  const rowSelection = {
    // selectedRowKeys,
    onChange: this.onSelectChange,
  };

  return(
      <Content>
        <div style={{marginTop: '10px', marginLeft: '10px', marginBottom: '10px'}}>
              <Button style={{ marginLeft: '10px' }} type='primary' onClick={this.props.handleBuildNetworkQuery}>新建</Button>
              {
                selectedRowKeys.length !== 0 ? 
                <Fragment>
                  <Button  style={{ marginLeft: '10px' }}>编辑</Button>
                  <Button  style={{ marginLeft: '10px' }} onClick={ () => this.props.handleDeleteNetworkQuery(selectedRowKeys)}>删除</Button>
                  <Button  style={{ marginLeft: '10px' }} onClick={ () => this.props.handleStartNetworkQuery(selectedRowKeys)}>启动</Button>
                </Fragment>
                :
                <Fragment>
                  <Button disabled style={{ marginLeft: '10px' }}>编辑</Button>
                  <Button disabled style={{ marginLeft: '10px' }}>删除</Button>
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
         
        </Content>
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
})

const mapDispatch = (dispatch) =>({
  handleBuildNetworkQuery(){
    dispatch(actionCreators.handleBuildNetworkQuery())
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
  })

export default connect(mapState, mapDispatch)(NetworkQueryList)