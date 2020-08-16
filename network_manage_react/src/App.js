import React, { Component } from 'react';
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Link} from 'react-router-dom'
import zhCN from 'antd/es/locale/zh_CN';
import Home from './page/device_query/index'
import DeviceQueryList from './page/device_query/device_query_task'
import DeviceQueryDetail from './page/device_query/device_query_detail'
import DevicePortToMAC from './page/device_query/device_port_macs'
import DevicePortToARP from './page/device_query/device_port_arps'
import WebSSH from './page/ssh/webssh'
import WebTelnet from './page/ssh/webtelnet'


import store from './store'
import 'antd/dist/antd.css';
import { ConfigProvider } from 'antd';


class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ConfigProvider locale={zhCN}>
          {/* <Route path='/' exact component={ Home }></Route> */}
          <Route path='/ssh/:id' exact component={ WebSSH }></Route>
          <Route path='/telnet/:id' exact component={ WebTelnet }></Route>
          <Route path='/device_details/:id' exact component={ DeviceQueryDetail }></Route>
          <Route path='/device_details/brige_macs/:id' exact component={ DevicePortToMAC }></Route>
          <Route path='/device_details/arp_table/:id' exact component={ DevicePortToARP }></Route>
          <Route path='/device_query/' exact component={ DeviceQueryList }></Route>
        </ConfigProvider>
      </BrowserRouter>
  </Provider>
    );
  }
}

export default App;
