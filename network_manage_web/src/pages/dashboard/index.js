import React, { Component, Fragment} from 'react'
import { Statistic, Row, Col, Button, Card } from 'antd';
import Line from './pie_echart'

class DashBoard extends Component{
  render(){
    return(
<Fragment>

    <Row gutter={16}>
      
      <Col span={4}>
      <Card>
        <Statistic title="IP地址数量" value={112893} />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
        <Statistic title="地址使用率" value={56.78} suffix="%" precision={2}/>
        </Card>
      </Col>
      <Col span={4}>
        <Card>
        <Statistic title="在线地址数量" value={112893}  />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
        <Statistic title="手动配置地址数量" value={112893}/>
        </Card>
      </Col>
      <Col span={4}>
        <Card>
        <Statistic title="未管理地址数量" value={112893}/>
        </Card>
      </Col>
      <Col span={4}>
        <Card>
        <Statistic title="冲突地址数量" value={112893} valueStyle={{ color: '#cf1322'}}/>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col span={8}>
        <Line/>
      </Col>
    </Row>
    </Fragment>
    )
  }
}

export default DashBoard