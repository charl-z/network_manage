import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import { Button, Modal, Input, Form,InputNumber, Alert, Select, Space, Layout, Radio } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import  SelectTime  from './SelectTime'


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

const  BuildNetworkQueryForm = (props) => {
  const { 
    BuildNetworkQueryVisible,
    getCheckNetworkQueryInputIpsInfo,
    showNetworkQueryCron,
    SelectTimeList,
    NetworkQueryEditContent,
    NetworkQueryEditTimeSelect,
    NetworkQueryEditShow
         } = props
  const [form] = Form.useForm();
  var tmpFormValues =
  {
    networks: NetworkQueryEditContent['network'], 
    tcp_query_ports: NetworkQueryEditContent['tcp_query_ports'],
    udp_query_ports: NetworkQueryEditContent['udp_query_ports'],
    crontab_task_status: NetworkQueryEditContent['auto_enable'],
  }
  var initialFormValues = Object.assign(tmpFormValues, NetworkQueryEditTimeSelect)
  
  return(
    <Modal 
      title= { NetworkQueryEditShow ? "编辑网络探测" : "新建网络探测"}
      visible={BuildNetworkQueryVisible} 
      footer={null}
      onCancel={() => props.handleNetworkQueryCancel(form)}
      >
      <Form {...layout}  
        name="network_query" 
        form={form}
        onFinish={(value) => props.handleNetworkQuerySubmit(form, value, NetworkQueryEditShow)} 
        validateMessages={validateMessages}
        initialValues={NetworkQueryEditShow ? initialFormValues :
        {
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
          {
            NetworkQueryEditShow ? 
              <Input disabled />
              :
              <Input.TextArea 
              placeholder="可以多个网络探测，多个网络之间用空格或分行分隔，例如192.168.1.0/24 192.168.2.0/24"
              autoSize={{ minRows: 3, maxRows: 5 }}
              />
          }
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
          name="crontab_task_status" 
          label='自动探测' 
          rules={[{ required: true }]} 
          >
          <Radio.Group onChange={props.hanleAutoNetworkQuerySwitch}>
            <Radio value="on">开启</Radio>
            <Radio value="off">关闭</Radio>
          </Radio.Group>
        </Form.Item>
        <div style={{marginLeft: '50px'}}>
            <Space direction='vertical'>
            {
              showNetworkQueryCron==="on" ? 
              <Fragment>
                {
                  SelectTimeList.map((item, index) => {
                    return (  
                    <div style={{display:'inline-block'}} key={index}>
                      <SelectTime selectValue={item} index={index}/>
                      {
                        SelectTimeList.size !== 1 ?  <MinusCircleOutlined
                        style={{ margin: '0 8px' }}
                        onClick={() => props.handleDeleteModel(index)}
                        /> : null
                      }
                    </div>
                    )
                  })
                }
              <Button
                type="dashed"
                onClick={props.handleAddField}
                style={{ width: '60%' }}
                >
                <PlusOutlined /> 添加定时任务
              </Button>
              </Fragment>      
              : null
            }
            </Space>
          </div>
          
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
  showNetworkQueryCron: state.getIn(['networkQuery', 'showNetworkQueryCron']),
  SelectTimeList: state.getIn(['networkQuery', 'SelectTimeList']),
  NetworkQueryEditContent: state.getIn(['networkQuery', 'NetworkQueryEditContent']),
  NetworkQueryEditTimeSelect: state.getIn(['networkQuery', 'NetworkQueryEditTimeSelect']),
  NetworkQueryEditShow: state.getIn(['networkQuery', 'NetworkQueryEditShow']),
})

const mapDispatch = (dispatch) =>({
  handleNetworkQueryCancel(form){
    dispatch(actionCreators.handleNetworkQueryCancel())
    form.resetFields()
  },
  handleNetworkQuerySubmit(form, value, editShow){
    // console.log(editShow)
    dispatch(actionCreators.handleNetworkQuerySubmit(form, value, editShow))
  },
  hanleAutoNetworkQuerySwitch(e){
    dispatch(actionCreators.hanleAutoNetworkQuerySwitch(e.target.value))
  },
  handleAddField(){
    dispatch(actionCreators.handleAddField())
  },
  handleDeleteModel(index){
    dispatch(actionCreators.handleDeleteModel(index))
  }
  })
export default connect(mapState, mapDispatch)(BuildNetworkQueryForm)