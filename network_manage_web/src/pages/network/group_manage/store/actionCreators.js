import * as constant from './actionTypes'
import http from '../../../../libs/http';

export const handleGetAllGroupInfo = (data) => ({
  type: constant.GET_ALL_GROUP_INFO,
  value: data
})

export const getAllGroupInfo = () => {
  return (dispatch) => {
    http.get('/api/group_manage/get_network_group_info/')
    .then((res) => {
      // console.log("res:", res)
      dispatch(handleGetAllGroupInfo(res.result))
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const getALLGroupName = (data) => ({
  type: constant.HANDLE_BUILD_GROUP,
  value: data 
})

export const handleBuildGroup = () => {
  return (dispatch) => {
    http.get('/api/group_manage/get_all_group_name/')
    .then((res) => {
      dispatch(getALLGroupName(res.result))
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const handleGroupMoadlCancel = () => ({
  type: constant.HANDLE_GROUP_GROUP_CANCEL,
})

export const handleGroupSelect = (data) => ({
  type: constant.HANDLE_GROUP_SELECT,
  value: data
})


export const handleGroupMoadleSubmitError  = (data) => ({
  type: constant.HANDLE_GROUP_MOADL_SUBMIT,
  value: data
})


export const handlGroupMoadleSubmit  = (value, currentGroup, editGroupStatus) => {
  return (dispatch) => {
    if(!editGroupStatus){
      http.post('/api/group_manage/new_build_group/', value)
      .then((res) => {
        if(res.status === "success"){
          dispatch(getAllGroupInfo())
        }
        else{
          dispatch(handleGroupMoadleSubmitError(res.result))
        }
        
      })
      .catch(function (error) {
        console.log(error);
      });
    }else{
      value["edit_pre"] = currentGroup // 编辑前的分组名称
      http.put('/api/group_manage/new_build_group/', value)
      .then((res) => {
        if(res.status === "success"){
          dispatch(getAllGroupInfo())
        }
        else{
          dispatch(handleGroupMoadleSubmitError(res.result))
        }
        
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }
}


export const handlDeleteGroup = (value) => {
  var param={group_name: value}
  return (dispatch) => {
    http.delete('/api/group_manage/new_build_group/', {data: param})
      .then((res) => {
        console.log("res:", res)
        dispatch(getAllGroupInfo())
        
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}

export const getParentGroupName = (data) => ({
  type: constant.HANDLE_EDIT_GROUP,
  value: data
})

export const handleEditGroup = (selectGroup) => {
  return (dispatch) => {
    http.get(`/api/group_manage/get_group_to_infos/?group=${selectGroup}`)
    .then((res) => {
      console.log(res)
      dispatch(getParentGroupName(res.result.parent_array))
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export const handleDeleteGroup = () => ({
  type: constant.HANDLE_DELETE_GROUP,
})



// export const handleDeleteGroup = (selectGroup) => {
//   var value = new Object()
//   value["group_name"] = selectGroup
//   return (dispatch) => {
    
//     http.post('/api/group_manage/delete_group/', value)
//     .then((res) => {
//       // console.log(res)
//       dispatch(getAllGroupInfo())
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
//   }
// } 

// type: constant.HANDLE_EDIT_GROUP,

