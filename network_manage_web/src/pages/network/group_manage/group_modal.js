import React, {  Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import { Button, Modal, Input, Form, Alert, Select, Tooltip } from 'antd';


const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 24 },
};


const GroupModal = (props) => {
  const {
          newBuildGroupModalVisible, 
          allGroupName,selectGroupName, 
          getCheckGroupInputErrorInfo, 
          editGroupStatus, 
          parentGroup
        } = props

  const handlGroupMoadleSubmit = (values) => {
    props.handlGroupMoadleSubmit(values, selectGroupName, editGroupStatus)
  }
  const [form] = Form.useForm();
  return(
    <Modal
      title={editGroupStatus ? "编辑分组" : "新建分组"}
      visible={newBuildGroupModalVisible}
      footer={null}
      onCancel={() => props.handleGroupMoadlCancel(form)}
      
    >
      <Form {...layout}  
        name="group_modal" 
        form={form}
        onFinish={handlGroupMoadleSubmit} 
      >
        {
          getCheckGroupInputErrorInfo ?  
          <Alert
          message="Error"
          message={ getCheckGroupInputErrorInfo}
          type="error"
          /> : null
        }
        <br/>
        {
          !editGroupStatus ?
          <Fragment>
            <Form.Item name="group_name" label="子分组名称" rules={[{ required: true }]}>
                <Input/>
            </Form.Item>
              <Tooltip title="选择为空，则为一级分组" placement="right">
                <Form.Item name="parent_group_name" label="父分组" initialValue={selectGroupName}>
                  <Select>
                  {
                    allGroupName.map(group => (
                      <Select.Option key={group}>{group}</Select.Option>
                    ))
                  }
                  </Select>
                </Form.Item>
              </Tooltip>
          </Fragment>
          :
          <Fragment>
            <Form.Item name="group_name" label="子分组名称" rules={[{ required: true }]} initialValue={selectGroupName}>
              <Input/>
            </Form.Item>
            <Tooltip title="选择为空，则为一级分组" placement="right">
              <Form.Item name="parent_group_name" label="父分组" initialValue={parentGroup}>
                <Select disabled>
                {
                  allGroupName.map(group => (
                    <Select.Option key={group}>{group}</Select.Option>
                  ))
                }
                </Select>
              </Form.Item>
            </Tooltip>
          </Fragment>
        }
      
        
        <Form.Item style={{marginLeft: '300px'}}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
  </Modal>
  )
}

const mapState = (state) => ({
  newBuildGroupModalVisible: state.getIn(['groupManage', 'newBuildGroupModalVisible']),
  allGroupName: state.getIn(['groupManage', 'allGroupName']),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
  getCheckGroupInputErrorInfo: state.getIn(['groupManage', 'getCheckGroupInputErrorInfo']),
  editGroupStatus: state.getIn(['groupManage', 'editGroupStatus']),
  parentGroup: state.getIn(['groupManage', 'parentGroup']),
})

const mapDispatch = (dispatch) =>({
  handleGroupMoadlCancel(){
    dispatch(actionCreators.handleGroupMoadlCancel())
    },
  handlGroupMoadleSubmit(value, selectGroupName, editGroupStatus){
    dispatch(actionCreators.handlGroupMoadleSubmit(value, selectGroupName, editGroupStatus))
    },
  })
export default connect(mapState, mapDispatch)(GroupModal)