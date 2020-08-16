import axios from "axios/index";
import * as constant from './actionTypes'
// import { fromJS } from 'immutable'


export const handleModalBtnCancelClick = () => ({
    type: constant.HANDLE_MODAL_BTN_CANCEL
})


export const handleInputChange = (value) => ({
    type: constant.GET_BRANCH_INPUT,
    value: value
})

export const handleVersionSelect = (value) => ({
    type: constant.GET_VERSION_SELECT,
    value
})

export const handleTestCaseSuiteSelect = (value) => ({
    type: constant.GET_TEST_CASE_SUIT_SELECT,
    value
})

function handleSubmitData(data){ //与箭头函数不同的写法
    let value
    if(data.status === 'fail'){
        value = true
    }
    else {
        value = false
    }
    return{
        type: constant.POST_TEST_DATA,
        value: value
    }
}

// export const handleBtnClick = (value) => {
//      return (dispatch) => {
//          const data = {
//         'branchInput': value.branchInput,
//         'versionSelect': value.versionSelect,
//         'testCaseSuiteSelect': value.testCaseSuiteSelect
//         }
//
//         axios.post('http://127.0.0.1:8001/api/package/', data)
//         .then((res) => {
//              // console.log("res:", res.data)
//              dispatch(handleSubmitData(res.data))
//         })
//         .catch(function (error) {
//         console.log(error);
//         });
//   }
// }

export const handleBtnClick = (value) => {
     return (dispatch) => {
         const data = {
        'branchInput': value.branchInput,
        'versionSelect': value.versionSelect,
        'testCaseSuiteSelect': value.testCaseSuiteSelect
        }

        axios.get('http://10.0.0.41:8001/api/get_reult_file/')
        .then((res) => {
             console.log("res:", res)
             dispatch(handleSubmitData(res.data))
        })
        .catch(function (error) {
        console.log(error);
        });
  }
}



