import { fromJS } from 'immutable'
// import * as constant from './actionTypes'
import * as constant from './actionTypes'
const defaultState = fromJS({
    branchInput: '',
    versionSelect: '',
    testCaseSuiteSelect: '',
    showPackageModal: false,
})


const getBranchInput = (state, action) => {
  return state.merge({
    'branchInput': action.value,
  })
}

const getVersionSelect = (state, action) => {
  return state.merge({
    'versionSelect': action.value,
  })
}

const getTestCaseSuiteSelect = (state, action) => {
  return state.merge({
    'testCaseSuiteSelect': action.value,
  })
}

const handleBtnClick = (state, action) => {
    return state.merge({
        'branchInput': '',
        'showPackageModal': action.value
  })
}

const handleModalBtnCancelClick = (state, action) => {
    return state.merge({
        'showPackageModal': false,
  })
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case constant.GET_BRANCH_INPUT:
            return getBranchInput(state, action);
            // console.log(state)
        case constant.GET_VERSION_SELECT:
          return getVersionSelect(state, action);
        case constant.GET_TEST_CASE_SUIT_SELECT:
          // console.log(action)
          return getTestCaseSuiteSelect(state, action)
        case constant.POST_TEST_DATA:
            // console.log(action)
            return handleBtnClick(state, action)
        case constant.HANDLE_MODAL_BTN_CANCEL:
            return handleModalBtnCancelClick(state, action)
    default:
      return state
  }

}