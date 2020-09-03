import React, {  Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import { Button, Modal, Input, Form,InputNumber, Alert, Select } from 'antd';
const { Option } = Select;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 24 },
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

const ConsoleForm = (props) => {
  const { consoleIPAddress, 
          consonleLoginVisible, 
          showConsoleCheckInfo, 
          getConsoleCheckInfo,
          showConsolePasswordShow,
          ConsoleSubmitClickStatus 
        } = props

  const handleConsoleSubmit = (values) => {
    values["hostname"] = consoleIPAddress
    props.handleConsoleInfoSubmit(values)
  }

  const [form] = Form.useForm();
  return(
    <Modal
    title="远程登陆配置" 
    visible={consonleLoginVisible}
    footer={null}
    onCancel={() => props.handleConsoleCancel(form)}
  >
    <Form {...layout}  
      name="console_login_setup" 
      form={form}
      onFinish={handleConsoleSubmit} 
      validateMessages={validateMessages}
      initialValues={{
        protocol: 'ssh',
        port: 22,
        username: 'root',
        password: ''
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
          onChange={ props.handleProtocolChange}
        >
          <Option value="ssh">ssh</Option>
          <Option value="telnet">telnet</Option>
        </Select>
      </Form.Item>
      
      {
        showConsolePasswordShow ?
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
      <Button disabled={ConsoleSubmitClickStatus} type="primary" htmlType="submit">
        登陆
      </Button>
      </Form.Item>
        </Form>
  </Modal>

  )
}

const mapState = (state) => ({
  consoleIPAddress: state.getIn(['networkQuery', 'consoleIPAddress']),
  consonleLoginVisible: state.getIn(['networkQuery', 'consonleLoginVisible']),
  showConsoleCheckInfo: state.getIn(['networkQuery', 'showConsoleCheckInfo']),
  getConsoleCheckInfo: state.getIn(['networkQuery', 'getConsoleCheckInfo']),
  showConsolePasswordShow: state.getIn(['networkQuery', 'showConsolePasswordShow']),
  ConsoleSubmitClickStatus: state.getIn(['networkQuery', 'ConsoleSubmitClickStatus']),
})

const mapDispatch = (dispatch) =>({
  handleConsoleInfoSubmit(values){
    dispatch(actionCreators.handleConsoleInfoSubmit(values))
  },
  handleConsoleCancel(form){
    dispatch(actionCreators.handleConsoleCancel())
    form.resetFields()
  },
  handleProtocolChange(value){
    dispatch(actionCreators.handleProtocolChange(value))
  },
  })
export default connect(mapState, mapDispatch)(ConsoleForm)