import React from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import {Modal} from 'antd';


const ConvertIpManual = (props) => {
  const {ConvertToManualModalVisible, ipDetailSelectedRows} = props

  return(
    <Modal
      title='解决冲突'
      visible={ConvertToManualModalVisible}
      onOk={() => props.convertIpManualOk(ipDetailSelectedRows)}
      onCancel={props.convertIpManualCancel}
    >
      <p>确定要将手动MAC设置成设备探测MAC吗？</p>
  </Modal>
  )
}

const mapState = (state) => ({
  ConvertToManualModalVisible: state.getIn(['networkManage', 'ConvertToManualModalVisible']),
  ipDetailSelectedRows: state.getIn(['networkManage', 'ipDetailSelectedRows']),
})

const mapDispatch = (dispatch) =>({
  convertIpManualCancel(){
    dispatch(actionCreators.convertIpManualCancel())
    },
  convertIpManualOk(ipDetailSelectedRows){
    dispatch(actionCreators.convertIpManualOk(ipDetailSelectedRows))
   },
  })
export default connect(mapState, mapDispatch)(ConvertIpManual)