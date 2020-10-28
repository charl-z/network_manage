import React from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import {Modal} from 'antd';


const ResloveIpDeatail = (props) => {
  const {ResolveIpConflictModalVisible, ipDetailSelectedRows} = props

  return(
    <Modal
      title='解决冲突'
      visible={ResolveIpConflictModalVisible}
      onOk={() => props.resloveIpDeataiOk(ipDetailSelectedRows)}
      onCancel={props.resloveIpDeatailCancel}
    >
      <p>确认解决冲突，将冲突地址MAC设置成设备探测MAC吗？</p>
  </Modal>
  )
}

const mapState = (state) => ({
  ResolveIpConflictModalVisible: state.getIn(['networkManage', 'ResolveIpConflictModalVisible']),
  ipDetailSelectedRows: state.getIn(['networkManage', 'ipDetailSelectedRows']),
})

const mapDispatch = (dispatch) =>({
  resloveIpDeatailCancel(){
    dispatch(actionCreators.resloveIpDeatailCancel())
    },
  resloveIpDeataiOk(ipDetailSelectedRows){
  dispatch(actionCreators.resloveIpDeataiOk(ipDetailSelectedRows))
   },
  })
export default connect(mapState, mapDispatch)(ResloveIpDeatail)