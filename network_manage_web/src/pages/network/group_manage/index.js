import React, { Component, Fragment } from 'react';
import { Tree, Space, Button, Tooltip } from 'antd';
import { actionCreators } from './store'
import { connect } from "react-redux";
import DeleteGroup from './delete_group_modal'
import { EditFilled, DeleteFilled, PlusSquareFilled, FastBackwardFilled } from '@ant-design/icons';
import styles from './group.module.css';
import GroupModal from './group_modal'
// const { Search } = Input;


class GroupManage extends Component{

  componentDidMount() {
    this.props.getAllGroupInfo()
  }

  render(){
    const {treeData, selectGroupName} = this.props;

    const onSelect = (selectedKeys, info) => {
      this.props.handleGroupSelect(info.node.title)
    };
    const onRightClick = (info) => {
      console.log(info)
    }
    return (
      <div className={styles.tree}>
        <div className={styles.tree_top}>
          <Space style={{marginLeft: '1px'}}>
            <FastBackwardFilled style={{marginLeft: '5px'}}/>
            {/* <PlusSquareFilled  style={{marginLeft: '5px'}} onClick={this.props.handleBuildGroup}/> */}
            <Tooltip title="新建分组" placement="top">
              <Button icon={<PlusSquareFilled/>} style={{marginLeft: '5px'}} size="small" type="text" onClick={this.props.handleBuildGroup}></Button>
            </Tooltip>

            {
              selectGroupName ? 
              <Fragment>
                <Tooltip title="编辑分组" placement="top">
                  <Button icon={<EditFilled/>} style={{marginLeft: '5px'}} size="small" type="text" onClick={() => this.props.handleEditGroup(selectGroupName)}></Button>
                </Tooltip>
                <Tooltip title="删除分组" placement="top">
                  <Button icon={<DeleteFilled/>}  size="small" type="text" onClick={this.props.handleDeleteGroup}></Button>
                </Tooltip>
              </Fragment>
                :
              <Fragment>
                <Tooltip title="未选择编辑的分组" placement="top">
                  <Button icon={<EditFilled/>} style={{marginLeft: '5px'}} disabled size="small" type="text"></Button>
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
    // console.log("handleDeleteGroup")
    dispatch(actionCreators.handleDeleteGroup())
  },

})

export default connect(mapState, mapDispatch)(GroupManage)
