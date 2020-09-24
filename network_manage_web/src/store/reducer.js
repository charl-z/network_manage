import { combineReducers} from 'redux-immutable'
import { reducer as deviceQueryReducer} from '../pages/network/device_query/store'
import { reducer as networkQueryReducer} from '../pages/network/network_query/store'
import { reducer as groupManageReducer} from '../pages/network/group_manage/store'
import { reducer as networkManageReducer} from '../pages/network/network_manage/store'

// import { fromJS } from 'immutable'

const reducer = combineReducers({
  deviceQuery: deviceQueryReducer,
  networkQuery: networkQueryReducer,
  groupManage: groupManageReducer,
  networkManage: networkManageReducer
})

export default reducer