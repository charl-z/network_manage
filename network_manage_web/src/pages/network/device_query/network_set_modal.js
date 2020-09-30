import React, { Component, Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import { Button, Modal, Spin, Form,InputNumber, Alert, Select, Space, Layout, Radio } from 'antd';


const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 24 },
};

const  NetworkSet = (props) => {
  const { 
    NetworkSetVisible,
    NetworkSetLoading,
    NetworkSet,
    selectGroupName
    } = props

  const [form] = Form.useForm();
  return(
    <Modal 
      title= "网络归集"
      visible={NetworkSetVisible} 
      footer={null}
      onCancel={props.NetworkSetCancel}
      >
      <Form {...layout}  
        name="network_set" 
        form={form}
        onFinish={props.handleNetworkSetSubmit} 
      >
        {
          NetworkSetLoading ? 
          <Space>
            <Spin size="small" />
            <Spin />
            <Spin size="large" />
          </Space> :
          <Fragment>
            <Form.Item name="group" label="分组名称" rules={[{ required: true }]} initialValue={selectGroupName}>
          <Select>
          {
            NetworkSet['all_groups'].map(group => (
              <Select.Option key={group}>{group}</Select.Option>
            ))
          }
          </Select>
        </Form.Item>
        <Form.Item name="networks" label="归集网络" rules={[{ required: true }]} >
          <Select 
            mode="multiple"
            allowClear
            placeholder="选择归集网络"
          >
          {
            NetworkSet['networks'].map(network => (
              <Select.Option key={network}>{network}</Select.Option>
            ))
          }
          </Select>
        </Form.Item>
    
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }} style={{marginTop: '10px'}}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
          </Fragment>
        }

        
    </Form>
  </Modal>
  )
}
const mapState = (state) => ({
  NetworkSetVisible: state.getIn(['deviceQuery', 'NetworkSetVisible']),
  NetworkSetLoading: state.getIn(['deviceQuery', 'NetworkSetLoading']),
  NetworkSet: state.getIn(['deviceQuery', 'NetworkSet']).toObject(),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
})

const mapDispatch = (dispatch) =>({
  NetworkSetCancel(){
    dispatch(actionCreators.NetworkSetCancel())
  },
  handleNetworkSetSubmit(value){
    dispatch(actionCreators.handleNetworkSetSubmit(value))
  }
  
 
})
export default connect(mapState, mapDispatch)(NetworkSet)