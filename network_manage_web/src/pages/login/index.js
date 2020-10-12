/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React from 'react';
import {Form, Input, Icon, Button, Tabs, Modal} from 'antd';
import styles from './login.module.css';
import history from 'libs/history';
import {http, updatePermissions} from 'libs';
import logo from './logo-spug-txt.png';
// import envStore from 'pages/config/environment/store';
// import appStore from 'pages/config/app/store';
// import requestStore from 'pages/deploy/request/store';
// import execStore from 'pages/exec/task/store';
// import hostStore from 'pages/host/store';

class LoginIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loginType: 'default'
    }
  }

  // componentDidMount() {
  //   envStore.records = [];
  //   appStore.records = [];
  //   requestStore.records = [];
  //   requestStore.deploys = [];
  //   hostStore.records = [];
  //   execStore.hosts = [];
  // }

  handleSubmit = (value) => {

    console.log("value:", value)

    this.props.form.validateFields((err, formData) => {
      if (!err) {
        this.setState({loading: true});
        formData['type'] = this.state.loginType;
        http.post('/api/account/login/', formData)
          .then(data => {
            if (!data['has_real_ip']) {
              Modal.warning({
                title: '安全警告',
                className: styles.tips,
                content: <div>
                  未能获取到客户端的真实IP，无法提供基于请求来源IP的合法性验证，详细信息请参考
                  <a target="_blank" href="https://spug.dev" rel="noopener noreferrer">官方文档</a>。
                </div>,
                onOk: () => this.doLogin(data)
              })
            } else {
              this.doLogin(data)
            }
          }, () => this.setState({loading: false}))
      }
    })
  };

  doLogin = (data) => {
    localStorage.setItem('token', data['access_token']);
    localStorage.setItem('nickname', data['nickname']);
    localStorage.setItem('is_supper', data['is_supper']);
    localStorage.setItem('permissions', JSON.stringify(data['permissions']));
    localStorage.setItem('host_perms', JSON.stringify(data['host_perms']));
    updatePermissions(data['is_supper'], data['host_perms'], data['permissions']);
    if (history.location.state && history.location.state['from']) {
      history.push(history.location.state['from'])
    } else {
      history.push('/welcome/index')
    }
  };

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <div><img className={styles.logo} src={logo} alt="logo"/></div>
          <div className={styles.desc}>网络设备管理运维平台</div>
        </div>
        <div className={styles.formContainer}>
          <Form onFinish={this.handleSubmit} >
            <Form.Item className={styles.formItem} name="user">
              <Input
                size="large"
                autoComplete="off"
                placeholder="请输入账户"
                prefix={<Icon type="user" className={styles.icon}/>}/>
            </Form.Item>
            <Form.Item className={styles.formItem} name="password">
              <Input
                size="large"
                type="password"
                autoComplete="off"
                placeholder="请输入密码"
                onPressEnter={this.handleSubmit}
                prefix={<Icon type="lock" className={styles.icon}/>}/>
            </Form.Item>
            <Form.Item className={styles.button}>
              <Button
                block
                size="large"
                type="primary"
                htmlType="submit"
                loading={this.state.loading}
                // onClick={this.handleSubmit}
                >
                  登录
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className={styles.footerZone}>
          <div className={styles.linksZone}>
            <a className={styles.links} title="官网" href="http://www.wadedy.cn"  target="_blank"
               rel="noopener noreferrer">官网</a>
            <a className={styles.links} title="Github" href="https://github.com/charl-z/network_manage/"  target="_blank"
               rel="noopener noreferrer"><Icon type="github" /></a>
            <a title="文档" href="https://github.com/charl-z/network_manage/"  target="_blank"
               rel="noopener noreferrer">文档</a>
          </div>
          <div style={{color: 'rgba(0, 0, 0, .45)'}}>Copyright <Icon type="copyright" /> 2020 By Charl-z</div>
        </div>
      </div>
    )
  }
}

export default LoginIndex
