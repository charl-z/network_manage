import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Table, Button, Modal, Input, Form,InputNumber, Pagination, Alert, Select} from 'antd';
import { Layout, Menu, Breadcrumb } from 'antd';
import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
// import { FormInstance } from 'antd/lib/form';
const { SubMenu } = Menu;
const { Option } = Select;
const { Header, Content, Footer, Sider } = Layout;
const { TextArea } = Input;


const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 24 },
};

const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

class DeviceQueryList extends Component{
  render(){
    const {
      selectedRowKeys, 
      deviceQueryInfos, 
      newBuiltDeviceVisible, 
      // checkDeviceQueryInputIps, 
      // getCheckDeviceQueryInputIpsInfo, 
      totalDeivces,
      deviceQueryPageSize,
      deviceQueryCurrentPage,
      consonleLoginVisible,
      consoleIPAddress,
      getConsoleCheckInfo,
      showConsoleCheckInfo,
      ConsoleSubmitClickStatus,
      consoleHostInfo,
      showConsolePassworkShow,
        } = this.props;
    // console.log(showConsolePassworkShow)
    const columns = [
      {
        title: '探测设备IP',
        dataIndex: 'ip_address',
        key: 'ip_address',
        render: (text, record) => <Link to={'/device_details/'+record.key}>{text}</Link> //record是对象
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
        title: '探测时间',
        dataIndex: 'query_time',
        key: 'query_time',
      },
      {
        title: '远程登陆',
        dataIndex: 'ssh',
        key: 'ssh',
        render: (text, record) => <Button type='primary'  onClick={() => this.props.handleConsoleClick(record.ip_address)}>Console</Button> //record是对象
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    
    const validateMessages = {
      required: '${label} 配置有误',
      types: {
        number: '${label} 不是一个有效整数',
      },
      number: {
        range: '${label} 大小必须在1到65535',
      },
    };
    
    return(
            
          <Content>
          <div style={{marginTop: '10px', marginLeft: '10px', marginBottom: '10px' }}>
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
          </div>
          <Modal 
            title="新建设备探测" 
            visible={newBuiltDeviceVisible} 
            footer={null}
            onCancel={this.props.handleDeviceQueryCancel}
            >
            <Form {...layout}  
              name="device_query" 
              onFinish={this.props.getDeviceQuerySubmit} 
              validateMessages={validateMessages}
              initialValues={{
                ['port']: 161,
                ['community']: 'public',
              }}
            >
              <Form.Item name="community" label="SNMP团体名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="port" label="端口" rules={[{ type: 'number', min: 0, max: 65535,  required: true }]}>
                <InputNumber />
              </Form.Item>
              <Form.Item name="device_ips" label="探测IP" rules={[{ required: true }]}>
                <Input.TextArea 
                  placeholder="可以多个设备探测的IP地址，多个IP地址之间用空格或分行分隔"
                  autoSize={{ minRows: 3, maxRows: 5 }}
                />
              </Form.Item>
             
              <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                <Button type="primary" htmlType="submit">
                  提交
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="远程登陆配置" 
            visible={consonleLoginVisible}
            footer={null}
            onCancel={this.props.handleConsoleCancel}
          >
            <Form {...layout}  
              name="console_login_setup" 
              onFinish={this.handleConsoleSubmit} 
              validateMessages={validateMessages}
              initialValues={{
                ['user']: 'root',
                ['port']: 22,
              }}
            >
              {
                showConsoleCheckInfo ?  
                <Alert
                message="Error"
                message={getConsoleCheckInfo}
                type="error"
                /> : ""
              }
             
              <Form.Item label="IP地址" >
                { consoleIPAddress }
              </Form.Item>
              <Form.Item name="protocol" label="协议" initialValue="ssh"> 
                <Select 
                  onChange={this.props.handleProtocolChange}
                >
                  <Option value="ssh">ssh</Option>
                  <Option value="telnet">telnet</Option>
                </Select>
              </Form.Item>
              
              {
                showConsolePassworkShow ?
                <Fragment>
                <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名!'}]}>
                  <Input />
                </Form.Item> 
                <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码!' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item name="port" label="端口" rules={[{ type: 'number', min: 0, max: 65535,  required: true }]}>
                  <InputNumber />
                </Form.Item>
                </Fragment>
                : ""
              }
              <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 21 }}>
              <Button disabled={this.props.ConsoleSubmitClickStatus} type="primary" htmlType="submit">
                登陆
              </Button>
              </Form.Item>
            </Form>
          </Modal>
          <Table 
            rowSelection={rowSelection} 
            columns={columns}
            dataSource={deviceQueryInfos} 
            tableLayout='auto'
            pagination={false}
          />
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
        </Content>

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

    handleConsoleSubmit = (values) => {
      values["hostname"] = this.props.consoleIPAddress
      this.props.handleConsoleInfoSubmit(values)
    }
  
  componentDidMount(){
    // console.log(this.props.deviceQueryCurrentPage, this.props.deviceQueryPageSize)
    this.props.getAllDeviceQueryInfo(this.props.deviceQueryCurrentPage, this.props.deviceQueryPageSize);
  }
}

const mapState = (state) => ({
  selectedRowKeys: state.getIn(['deviceQuery', 'selectedRowKeys']),
  deviceQueryInfos: state.getIn(['deviceQuery', 'deviceQueryInfos']),
  // loading: state.getIn(['deviceQuery', 'loading']),
  newBuiltDeviceVisible: state.getIn(['deviceQuery', 'newBuiltDeviceVisible']),
  checkDeviceQueryInputIps: state.getIn(['deviceQuery', 'checkDeviceQueryInputIps']),
  getCheckDeviceQueryInputIpsInfo: state.getIn(['deviceQuery', 'getCheckDeviceQueryInputIpsInfo']),
  // pagination: state.getIn(['deviceQuery', 'pagination']),
  totalDeivces: state.getIn(['deviceQuery', 'totalDeivces']),
  deviceQueryCurrentPage: state.getIn(['deviceQuery', 'deviceQueryCurrentPage']),
  deviceQueryPageSize: state.getIn(['deviceQuery', 'deviceQueryPageSize']),
  consonleLoginVisible: state.getIn(['deviceQuery', 'consonleLoginVisible']),
  consoleIPAddress: state.getIn(['deviceQuery', 'consoleIPAddress']),
  getConsoleCheckInfo: state.getIn(['deviceQuery', 'getConsoleCheckInfo']),
  showConsoleCheckInfo: state.getIn(['deviceQuery', 'showConsoleCheckInfo']),
  ConsoleSubmitClickStatus: state.getIn(['deviceQuery', 'ConsoleSubmitClickStatus']),
  consoleHostInfo: state.getIn(['deviceQuery', 'consoleHostInfo']),
  showConsolePassworkShow: state.getIn(['deviceQuery', 'showConsolePassworkShow']),
})

const mapDispatch = (dispatch) =>({
  getSelectQuery(selectedRowKeys){
    // console.log(selectedRowKeys)
    dispatch(actionCreators.getSelectQuery(selectedRowKeys))
  },
  getAllDeviceQueryInfo(currentPage, pageSize){
    // console.log(currentPage, pageSize)
    dispatch(actionCreators.getAllDeviceQueryInfo(currentPage, pageSize))
  },
  handleNewBuildDeviceQuery(){
    dispatch(actionCreators.handleNewBuildDeviceQuery())
  },
  handleDeviceQueryCancel(){
    dispatch(actionCreators.handleDeviceQueryCancel())
  },
  getDeviceQuerySubmit(values){
    // console.log("values:", values)
    dispatch(actionCreators.getDeviceQuerySubmit(values))
  },
  handleDeleteDeviceQuery(values){
    // console.log("delete:", values)
    dispatch(actionCreators.handleDeleteDeviceQuery(values))
    },
  handleStartDeviceQuery(values){
    // console.log("delete:", values)
    dispatch(actionCreators.handleStartDeviceQuery(values))
  },
  handlePageChange(pageNumber, pageSize) {
      // console.log( pageNumber, pageSize);
      dispatch(actionCreators.getAllDeviceQueryInfo( pageNumber, pageSize))
  },
  handlePageSizeChange(current, pageSize){
    console.log(current, pageSize);
    if(current===0){
      current = 1
    }
    dispatch(actionCreators.getAllDeviceQueryInfo(current, pageSize))
  },
  handleConsoleClick(ipAddress){
    dispatch(actionCreators.handleConsoleClick(ipAddress))
  },
  handleConsoleCancel(){
    dispatch(actionCreators.handleConsoleCancel())
  },
  handleConsoleInfoSubmit(values){
    // console.log("values--:", values)
    dispatch(actionCreators.handleConsoleInfoSubmit(values))
  },
  handleProtocolChange(value){
    // console.log("values--:", value)
    dispatch(actionCreators.handleProtocolChange(value))
  }
  
  })

export default connect(mapState, mapDispatch)(DeviceQueryList)