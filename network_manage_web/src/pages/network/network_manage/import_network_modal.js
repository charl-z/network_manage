import React from 'react'
import { actionCreators } from './store'
import { connect } from "react-redux";
import 'antd/dist/antd.css';
import {Modal, Button, Space, Divider, Spin } from 'antd';
import ReactFileReader from 'react-file-reader';
import { UploadOutlined } from '@ant-design/icons';

const ImportNetwork = (props) => {
  const {importNetworkModalVisible, importNeworkErrorMessages, importNetworkLoading, selectGroupName} = props

  const handleFiles = (files) => {
    props.handleCSVtData(files.base64, selectGroupName)
  }
  return(
    <Modal
      title='网络数据导入'
      visible={importNetworkModalVisible}
      footer={null}
      onCancel={props.importNetworkMoadlCancel}
    >
      <Space direction="vertical"> 
        <Space>
          <label>导入模板:</label>
          <a href="/static/file/networks.csv" download="网络地址.csv" >网络地址.csv</a>
        </Space>
        {importNeworkErrorMessages ? <p style={{color: 'red'}}>{importNeworkErrorMessages}</p> : null}
        {
          importNetworkLoading ? 
          <Space>
            <Spin size="small" />
            <Spin />
            <Spin size="large" />
          </Space> : null
        }
      </Space>
      <Divider />
    <Space>
      <Button onClick={props.importNetworkMoadlCancel}>取消</Button>
      <ReactFileReader fileTypes={[".csv"]} base64={true} handleFiles={handleFiles}>
        {
          importNetworkLoading ?
          <Button type='primary' disabled icon={<UploadOutlined />}>点击上传数据</Button>
            :
          <Button type='primary' icon={<UploadOutlined />}>点击上传数据</Button>
        }
        
      </ReactFileReader>
    </Space>
    
  </Modal>
  )
}

const mapState = (state) => ({
  importNetworkModalVisible: state.getIn(['networkManage', 'importNetworkModalVisible']),
  importNeworkErrorMessages: state.getIn(['networkManage', 'importNeworkErrorMessages']),
  importNetworkLoading: state.getIn(['networkManage', 'importNetworkLoading']),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
})


const mapDispatch = (dispatch) =>({
  importNetworkMoadlCancel(){
    dispatch(actionCreators.importNetworkMoadlCancel())
    },
  handleCSVtData(file, selectGroupName){
    dispatch(actionCreators.handleCSVtData(file, selectGroupName))
  },
  })
export default connect(mapState, mapDispatch)(ImportNetwork)