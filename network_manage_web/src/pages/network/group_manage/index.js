import React, { Component, Fragment } from 'react';
import { Tree, Space, Button, Tooltip } from 'antd';
import { actionCreators } from './store'
import { connect } from "react-redux";
import DeleteGroup from './delete_group_modal'
import { EditFilled, DeleteFilled, PlusSquareFilled } from '@ant-design/icons';

import GroupModal from './group_modal'
// const { Search } = Input;


class GroupManage extends Component{

  componentDidMount() {
    this.props.getAllGroupInfo()
  }

  render(){
    const {treeData, selectGroupName} = this.props;
    console.log("selectGroupName:", selectGroupName)

    const onSelect = (selectedKeys, info) => {
      console.log('selected', selectedKeys, info);
      this.props.handleGroupSelect(selectedKeys[0])
    };
    const onRightClick = (info) => {
      console.log(info)
    }
    return (
      <div style={{marginTop: '100px'}}>
        <div >
          <Space>
            {/* <PlusSquareFilled  style={{marginLeft: '5px'}} onClick={this.props.handleBuildGroup}/> */}
            <Tooltip title="新建分组" placement="top">
              <Button icon={<PlusSquareFilled/>} style={{marginLeft: '5px'}} size="small" type="text" onClick={this.props.handleBuildGroup}></Button>
            </Tooltip>

            {
              selectGroupName ? 
              <Fragment>
                <Tooltip title="编辑分组" placement="top">
                  <Button icon={<EditFilled/>} style={{marginLeft: '25px'}} size="small" type="text" onClick={() => this.props.handleEditGroup(selectGroupName)}></Button>
                </Tooltip>
                <Tooltip title="删除分组" placement="top">
                  <Button icon={<DeleteFilled/>}  size="small" type="text" onClick={this.props.handleDeleteGroup}></Button>
                </Tooltip>
              </Fragment>
                :
              <Fragment>
                <Tooltip title="未选择编辑的分组" placement="top">
                  <Button icon={<EditFilled/>} style={{marginLeft: '25px'}} disabled size="small" type="text"></Button>
                </Tooltip>
                <Tooltip title="删除分组" placement="top">
                  <Button icon={<DeleteFilled/>}  size="small" type="text" disabled></Button>
                </Tooltip>
              </Fragment>
            }
            
          </Space>
          
        </div>
        <Tree
          showLine={true}
          showIcon={true}
          defaultExpandedKeys={['默认组']}
          onSelect={onSelect}
          treeData={treeData}
          onRightClick={onRightClick}
        />
       
       {
         this.props.newBuildGroupModalVisible && <GroupModal/>
       }
       {
         this.props.deleteGroupModalVisible && <DeleteGroup/>
       }
      </div>
      
    );
  }
}
const mapState = (state) => ({
  treeData: state.getIn(['groupManage', 'treeData']),
  selectGroupName: state.getIn(['groupManage', 'selectGroupName']),
  newBuildGroupModalVisible: state.getIn(['groupManage', 'newBuildGroupModalVisible']),
  deleteGroupModalVisible: state.getIn(['groupManage', 'deleteGroupModalVisible']),
})

const mapDispatch = (dispatch) =>({
  getAllGroupInfo(){
    dispatch(actionCreators.getAllGroupInfo())
  },
  handleGroupSelect(selectGroup){
    dispatch(actionCreators.handleGroupSelect(selectGroup))
  },
  handleBuildGroup(){
    dispatch(actionCreators.handleBuildGroup())
  },
  handleEditGroup(selectGroup){
    dispatch(actionCreators.handleEditGroup(selectGroup))
  },
  handleDeleteGroup(){
    console.log("handleDeleteGroup")
    dispatch(actionCreators.handleDeleteGroup())
  },

})

export default connect(mapState, mapDispatch)(GroupManage)
