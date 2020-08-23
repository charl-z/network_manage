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

class DeviceQueryShowTable extends Component{
  render(){
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
    
  }
}