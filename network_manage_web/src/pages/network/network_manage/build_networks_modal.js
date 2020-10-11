import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import { Button, Modal, Input, Form,InputNumber, Alert, Select, Space, Layout, Radio } from 'antd';


const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 24 },
};

const  NetworkManageForm = (props) => {
  const { 
    BuildNetworksVisible,
    allGroupName,
    selectGroupName
    } = props
  console.log("selectGroupName:", selectGroupName, allGroupName)

  const [form] = Form.useForm();
  return(
    <Modal 
      title= "新建网络"
      visible={BuildNetworksVisible} 
      footer={null}
      onCancel={() => props.handleBuildNetworkCancel(form)}
      >
      <Form {...layout}  
        name="network_manage" 
        form={form}
        onFinish={props.handleNetworkManageSubmit} 
      >
        <br/>
        <Form.Item 
          name="networks" 
          label="网络" 
          rules={[{ required: true }]} 
          >
            <Input.TextArea 
            placeholder="可以同时新建多个网络，多个网络之间用空格或分行分隔，例如192.168.1.0/24 192.168.2.0/24"
            autoSize={{ minRows: 3, maxRows: 5 }}
            />
        </Form.Item>
        <Form.Item name="parent_group_name" label="所属分组" initialValue={selectGroupName ? selectGroupName : allGroupName[0]}>
            <Select>
            {
              allGroupName.map(group => (
                <Select.Option key={group}>{group}</Select.Option>
              ))
            }
            </Select>
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
  BuildNetworksVisible: state.getIn(['networkManage', 'BuildNetworksVisible']),
  allGroupName: state.getIn(['networkManage', 'allGroupName']),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
})

const mapDispatch = (dispatch) =>({
  handleNetworkManageSubmit(value){
    console.log(value)
    dispatch(actionCreators.handleNetworkManageSubmit(value))
    // form.resetFields()
  },
  handleBuildNetworkCancel(form){
    dispatch(actionCreators.handleBuildNetworkCancel())
    form.resetFields()
  }
  
 
  })
export default connect(mapState, mapDispatch)(NetworkManageForm)