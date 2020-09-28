import React from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import {Modal} from 'antd';



const DeleteNetwork = (props) => {
  const {selectedRowKeys, deleteNetworkModalVisible, selectGroupName} = props

  return(
    <Modal
      title='删除网络'
      visible={deleteNetworkModalVisible}
      onOk={() => props.deleteNetworksOk(selectedRowKeys, selectGroupName)}
      onCancel={props.deleteNetworkMoadlCancel}
    >
      <p>确认删除{selectedRowKeys.join(",")}吗？</p>
  </Modal>
  )
}

const mapState = (state) => ({
  deleteNetworkModalVisible: state.getIn(['networkManage', 'deleteNetworkModalVisible']),
  selectedRowKeys: state.getIn(['networkManage', 'selectedRowKeys']),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
})

const mapDispatch = (dispatch) =>({
  deleteNetworkMoadlCancel(){
    dispatch(actionCreators.deleteNetworkMoadlCancel())
    },
    deleteNetworksOk(selectedRowKeys, selectGroupName){
      console.log(selectedRowKeys, selectGroupName)
      dispatch(actionCreators.deleteNetworksOk(selectedRowKeys, selectGroupName))
    },
  })
export default connect(mapState, mapDispatch)(DeleteNetwork)