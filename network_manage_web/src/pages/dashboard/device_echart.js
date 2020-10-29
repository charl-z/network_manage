import React from 'react';
import {Card, Select } from 'antd';

import 'echarts/lib/chart/pie';  //折线图是line,饼图改为pie,柱形图改为bar
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import ReactEcharts from 'echarts-for-react';

export default class DeviceEchart extends React.Component{
  getOption =()=> {
    let option = {
      title: {
        text: '设备端口使用情况',
        left: 'center'
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
        orient: 'vertical',
        left: 10,
        data: ['在线地址', '未管理地址', '手动地址', '冲突地址']
    },
    series: [
        {
            name: '访问来源',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '20',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: [
                {value: 335, name: '在线地址'},
                {value: 310, name: '未管理地址'},
                {value: 234, name: '手动地址'},
                {value: 135, name: '冲突地址'},
                // {value: 1548, name: '搜索引擎'}
            ]
        }
    ]
};

   return option
  }

  render(){
    return(
      <div>
        <Card>
        <Select defaultValue="lucy" style={{ width: 120 }} allowClear>
          <Option value="lucy">Lucy</Option>
        </Select>
          <ReactEcharts option={this.getOption()} />
        </Card>
      </div>
    )
  }
}
