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
  const { newBuiltDeviceVisible, 
          getCheckDeviceQueryInputIpsInfo, 
          showDeivceQueryCron, SelectTimeList, 
          DeivceQueryEditShow, 
          DeivceQueryEditContent,
          DeivceQueryEditTimeSelect
         } = props
  const [form] = Form.useForm();
  var tmpFormValues =
  {
    device_ips: DeivceQueryEditContent['ip_address'], 
    port: DeivceQueryEditContent['snmp_port'],
    community: DeivceQueryEditContent['snmp_community'],
    crontab_task: DeivceQueryEditContent['auto_enable'],
  }
  // console.log("********DeivceQueryEditTimeSelect:", DeivceQueryEditTimeSelect, "SelectTimeList:", SelectTimeList)
  var initialFormValues = Object.assign(tmpFormValues, DeivceQueryEditTimeSelect)


  return(
    <Modal 
      title= {DeivceQueryEditShow ? "编辑设备探测" : "新建设备探测" }
      visible={newBuiltDeviceVisible} 
      footer={null}
      onCancel={() => props.handleDeviceQueryCancel(form)}
      >
      <Form {...layout}  
        name="device_query" 
        form={form}
        onFinish={(value) => props.getDeviceQuerySubmit(form, value, DeivceQueryEditShow)} 
        validateMessages={validateMessages}
        initialValues={DeivceQueryEditShow ?
          initialFormValues
          :
          {
            device_ips: "", 
            port:161,
            community: "public",
            crontab_task: "off",
          }
        }
      >
        {
          getCheckDeviceQueryInputIpsInfo ?  
          <Alert
          message="Error"
          message={ getCheckDeviceQueryInputIpsInfo.join('\n') }
          type="error"
          /> : null
        }
        <br/>
        <Form.Item 
          name="device_ips" 
          label="探测IP" 
          rules={[{ required: true }]} 
          >
            {
              DeivceQueryEditShow ? 
                <Input disabled />
                :
              <Input.TextArea 
                placeholder="可以多个设备探测的IP地址，多个IP地址之间用空格或分行分隔"
                autoSize={{ minRows: 3, maxRows: 5 }}
                />
            }
        </Form.Item>
        <Form.Item name="community" label="SNMP团体名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="port" label="端口" rules={[{ type: 'number', min: 0, max: 65535,  required: true }]}>
          <InputNumber />
        </Form.Item>
        <Form.Item 
          name="crontab_task" 
          label='自动探测' 
          rules={[{ required: true }]} 
          >
          <Radio.Group onChange={props.hanleAutoDeviceQuerySwitch} value={showDeivceQueryCron}>
            <Radio value="on">开启</Radio>
            <Radio value="off">关闭</Radio>
          </Radio.Group>
        </Form.Item>
          <div style={{marginLeft: '50px'}}>
            <Space direction='vertical'>
            {
              showDeivceQueryCron==="on" ? 
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
  getCheckDeviceQueryInputIpsInfo: state.getIn(['deviceQuery', 'getCheckDeviceQueryInputIpsInfo']),
  newBuiltDeviceVisible: state.getIn(['deviceQuery', 'newBuiltDeviceVisible']),
  showDeivceQueryCron: state.getIn(['deviceQuery', 'showDeivceQueryCron']),
  SelectTimeList: state.getIn(['deviceQuery', 'SelectTimeList']),
  DeivceQueryEditShow: state.getIn(['deviceQuery', 'DeivceQueryEditShow']),
  DeivceQueryEditContent: state.getIn(['deviceQuery', 'DeivceQueryEditContent']),
  DeivceQueryEditTimeSelect: state.getIn(['deviceQuery', 'DeivceQueryEditTimeSelect']),
})

const mapDispatch = (dispatch) =>({
  handleDeviceQueryCancel(form){
    form.resetFields()
    dispatch(actionCreators.handleDeviceQueryCancel())
    form.resetFields()
    // console.log("handleDeviceQueryCancel===========")
  },
  hanleAutoDeviceQuerySwitch(e){
    dispatch(actionCreators.hanleAutoDeviceQuerySwitch(e.target.value))
  },
  getDeviceQuerySubmit(form, value, editShow){
    // console.log("----------", form.getFieldsValue())
    dispatch(actionCreators.getDeviceQuerySubmit(value, form, editShow))
  },
  handleModelChange(value){
    dispatch(actionCreators.handleModelChange(value))
  },
  handleAddField(){
    dispatch(actionCreators.handleAddField())
  },
  handleDeleteModel(index){
    dispatch(actionCreators.handleDeleteModel(index))
  }
  })
export default connect(mapState, mapDispatch)(BuildDiviceQueryForm)