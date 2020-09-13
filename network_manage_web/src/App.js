import React, { Component } from 'react';
import {Switch, Route} from 'react-router-dom';
import { Provider } from 'react-redux'
import WebSSH from './pages/ssh/webssh';
import WebTelnet from './pages/ssh/webtelnet';
import GroupManage from './pages/network/group_manage/'
import Layout from './layout';
import store from './store'
class App extends Component {
  render() {
    return (
      <Provider store={store}>
      <Switch>
        <Route path="/telnet/:id" exact component={WebTelnet} />
        <Route path="/ssh/:id" exact component={WebSSH} />
        <Route path="/test/" exact component={GroupManage} />
        <Route component={Layout} />
      </Switch>
      </Provider>
    );
  }
}

export default App;
