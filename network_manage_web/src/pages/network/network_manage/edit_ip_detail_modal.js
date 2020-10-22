import React from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import { Button, Modal, Input, Form, Select} from 'antd';
import { ValidateMacAddress } from '../../../libs/functools'


const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 24 },
};


const  EditIpDetailModal = (props) => {
  const { 
    EditIpDetailModalVisible,
    ipDetailSelectedRows
    } = props

  const [form] = Form.useForm();
  return(
    <Modal 
      title= "编辑IP地址"
      visible={EditIpDetailModalVisible} 
      footer={null}
      onCancel={() => props.handleEditIpDetailModalCancel(form)}
      >
      <Form {...layout}  
        name="network_manage" 
        form={form}
        onFinish={props.handleEditIpDetailSubmit} 
      >
        <br/>
        <Form.Item 
          name="ip" 
          label="IP地址" 
          rules={[{ required: true }]}
          initialValue={ipDetailSelectedRows[0].key}
        >
          <Input disabled/>
        </Form.Item>

        <Form.Item 
          name="network" 
          label="网络" 
          rules={[{ required: true }]}
          initialValue={ipDetailSelectedRows[0].network}
        >
          <Input disabled/>
        </Form.Item>

        <Form.Item name="type" label="地址类型" initialValue="手动地址">
          <Select>
            <Select.Option key="手动地址">手动地址</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item 
          name="mac" 
          label="MAC地址" 
          initialValue={ipDetailSelectedRows[0].manual_mac}

          rules={[
            () => ({
              validator(rule, value) {
                if (ValidateMacAddress(value)) {
                  return Promise.resolve();
                }
                return Promise.reject('MAC地址输入格式不正确！');
              },
            }),
          ]}

          >
          <Input/>
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
  EditIpDetailModalVisible: state.getIn(['networkManage', 'EditIpDetailModalVisible']),
  ipDetailSelectedRows: state.getIn(['networkManage', 'ipDetailSelectedRows']),
})

const mapDispatch = (dispatch) =>({
  handleEditIpDetailSubmit(value){
    console.log(value)
    dispatch(actionCreators.handleEditIpDetailSubmit(value))
  },
  handleEditIpDetailModalCancel(form){
    dispatch(actionCreators.handleEditIpDetailModalCancel())
    form.resetFields()
  }
  })
export default connect(mapState, mapDispatch)(EditIpDetailModal)