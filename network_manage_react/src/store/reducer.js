import { combineReducers} from 'redux-immutable'
import { reducer as homeReducer } from '../page/home/store'
import { reducer as deviceQueryReducer} from '../page/device_query/store'

// import { fromJS } from 'immutable'

const reducer = combineReducers({
  home: homeReducer, 
  deviceQuery: deviceQueryReducer
})

export default reducer