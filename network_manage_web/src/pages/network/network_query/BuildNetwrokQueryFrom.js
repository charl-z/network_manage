import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import 'antd/dist/antd.css';
import { Button, Modal, Input, Form,InputNumber, Alert, Select, Space, Layout, Radio } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import  SelectTime  from './SelectTime'
const { Option } = Select;
const { Content } = Layout;

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

const  BuildDiviceQueryForm = (props) => {
  const { 
    BuildNetworkQueryVisible,
    getCheckNetworkQueryInputIpsInfo
         } = props
  const [form] = Form.useForm();
  
  return(
    <Modal 
      title= "新建网络探测" 
      visible={BuildNetworkQueryVisible} 
      footer={null}
      onCancel={() => props.handleNetworkQueryCancel(form)}
      >
      <Form {...layout}  
        name="network_query" 
        form={form}
        onFinish={(value) => props.handleNetworkQuerySubmit(form, value)} 
        validateMessages={validateMessages}
        initialValues={{
          crontab_task: "off",
          tcp_query_ports: "",
          udp_query_ports: ""
        }}
      >
        {
          getCheckNetworkQueryInputIpsInfo ?  
          <Alert
          message="Error"
          message={ getCheckNetworkQueryInputIpsInfo.join('\n') }
          type="error"
          /> : null
        }
        <br/>
        <Form.Item 
          name="networks" 
          label="网络" 
          rules={[{ required: true }]} 
          >
          <Input.TextArea 
            placeholder="可以多个网络探测，多个网络之间用空格或分行分隔，例如192.168.1.0/24 192.168.2.0/24"
            autoSize={{ minRows: 3, maxRows: 5 }}
            />
        </Form.Item>
        <Form.Item name="tcp_query_ports" label="TCP探测端口">
          <Input.TextArea 
            placeholder="输入需要探测的端口，用逗号分割，不支持范围输入，例如80,1024,65535"
            autoSize={{ minRows: 2, maxRows: 5 }}
            />
        </Form.Item>
        <Form.Item name="udp_query_ports" label="UDP探测端口">
          <Input.TextArea 
            placeholder="输入需要探测的端口，用逗号分割，不支持范围输入，例如53,55"
            autoSize={{ minRows: 2, maxRows: 5 }}
            />
        </Form.Item>
        <Form.Item 
          name="crontab_task" 
          label='自动探测' 
          rules={[{ required: true }]} 
          >
          <Radio.Group>
            <Radio value="on">开启</Radio>
            <Radio value="off">关闭</Radio>
          </Radio.Group>
        </Form.Item>
          
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }} style={{marginTop: '10px'}}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
    </Form>
  </Modal>
  )
}
const mapState = (state) => ({
  BuildNetworkQueryVisible: state.getIn(['networkQuery', 'BuildNetworkQueryVisible']),
  getCheckNetworkQueryInputIpsInfo: state.getIn(['networkQuery', 'getCheckNetworkQueryInputIpsInfo']),
})

const mapDispatch = (dispatch) =>({
  handleNetworkQueryCancel(form){
    dispatch(actionCreators.handleNetworkQueryCancel())
    form.resetFields()
  },
  handleNetworkQuerySubmit(form, value){
    dispatch(actionCreators.handleNetworkQuerySubmit(form, value))
  }
  
  })
export default connect(mapState, mapDispatch)(BuildDiviceQueryForm)