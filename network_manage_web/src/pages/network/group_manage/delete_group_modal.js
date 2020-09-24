import React, {  Fragment} from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import { Button, Modal, Input, Form, Alert, Select, Tooltip } from 'antd';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 24 },
};


const DeleteGroup = (props) => {
  const {selectGroupName, deleteGroupModalVisible} = props

  return(
    <Modal
      title='删除分组'
      visible={deleteGroupModalVisible}
      onOk={() => props.handlDeleteGroup(selectGroupName)}
      onCancel={props.handleGroupMoadlCancel}
    >
      <p>确认删除{selectGroupName}分组及其下面的所有网络配置吗？</p>
  </Modal>
  )
}

const mapState = (state) => ({
  // newBuildGroupModalVisible: state.getIn(['groupManage', 'newBuildGroupModalVisible']),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
  deleteGroupModalVisible: state.getIn(['groupManage', 'deleteGroupModalVisible']),
})

const mapDispatch = (dispatch) =>({
  handleGroupMoadlCancel(){
    dispatch(actionCreators.handleGroupMoadlCancel())
    },
    handlDeleteGroup(selectGroupName){
      dispatch(actionCreators.handlDeleteGroup(selectGroupName))
    },
  })
export default connect(mapState, mapDispatch)(DeleteGroup)