import { fromJS,List  } from 'immutable'
import * as constant from './actionTypes'

const defaultState = fromJS({
  newBuildGroupModalVisible: false,
  treeData: List([]),
  allGroupName: [],
  selectGroupName: '',
  getCheckGroupInputErrorInfo: '',
  editGroupStatus: false,
  deleteGroupModalVisible: false,
  parentGroup: ""
})


function handleGetAllGroupInfo(state, action){
  return state.merge({
    'treeData': action.value,
    'newBuildGroupModalVisible': false,
    'getCheckGroupInputErrorInfo': '',
    'editGroupStatus': false,
    'deleteGroupModalVisible': false,
    'selectGroupName': '',

    
  })
}

export const handleGroupSelect = (state, action) => {
  console.log("action:", action)
  return state.merge({
    'selectGroupName': action.value,
  })
}

export const handleBuildGroup  = (state, action) => {
  return state.merge({
    'newBuildGroupModalVisible': true,
    'allGroupName': action.value
  })
}

export const handleGroupMoadlCancel = (state, action) => {
  return state.merge({
    'newBuildGroupModalVisible': false,
    'getCheckGroupInputErrorInfo': '',
    'editGroupStatus': false,
    'deleteGroupModalVisible': false
  })
}

export const handleGroupMoadleSubmitError = (state, action) => {
  return state.merge({
    'getCheckGroupInputErrorInfo': action.value
  })
}

export const handleEditroup =  (state, action) => {
  return state.merge({
    'newBuildGroupModalVisible': true,
    'editGroupStatus': true,
    "parentGroup": action.value
  })
}

export const handleDeleteGroup =  (state, action) => {
  return state.merge({
    // 'newBuildGroupModalVisible': true,
    'deleteGroupModalVisible': true
  })
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case constant.GET_ALL_GROUP_INFO:
      return handleGetAllGroupInfo(state, action)
    case constant.HANDLE_GROUP_SELECT:
      return handleGroupSelect(state, action)
    case constant.HANDLE_BUILD_GROUP:
      return handleBuildGroup(state, action)
    case constant.HANDLE_GROUP_GROUP_CANCEL:
      return handleGroupMoadlCancel(state, action)
    case constant.HANDLE_GROUP_MOADL_SUBMIT:
      return handleGroupMoadleSubmitError(state, action)
    case constant.HANDLE_EDIT_GROUP:
      return handleEditroup(state, action)
    case constant.HANDLE_DELETE_GROUP:
      return handleDeleteGroup(state, action)
    default:
      return state
  }
}