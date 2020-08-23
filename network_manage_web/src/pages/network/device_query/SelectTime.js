import React, { Component, Fragment} from 'react'
import { connect } from "react-redux";
import { actionCreators } from './store'
import { Space, Select, Form, Input} from 'antd';
import {models, minutes, weeks, days, hours} from '../../../libs/constant'


class SelectTime extends Component{
  render(){
    const { SelectTimeList} = this.props;
    // console.log("SelectTimeList:", SelectTimeList)
    var selectShow;

    var minuteSelect = (
      <Form.Item name={"minute_" + this.props.index} noStyle rules={[{ required: true, message: '必选项' }]}>
        <Select style={{ width: 100 }}>
          {minutes.map(minute => (
            <Select.Option key={minute}>{minute}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    )

    var daySelect = (
      <Form.Item name={"day_" + this.props.index} noStyle rules={[{ required: true, message: '必选项' }]}>
        <Select style={{ width: 100 }}>
          {days.map(day => (
            <Select.Option key={day}>{day}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    )

    var hoursSelect = (
      <Form.Item name={"hour_" + this.props.index} noStyle rules={[{ required: true, message: '必选项' }]} >
        <Select style={{ width: 100 }}>
          {hours.map(hour => (
            <Select.Option key={hour}>{hour}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    )

    var weekSelect = (
      <Form.Item  name={"week_" + this.props.index} noStyle rules={[{ required: true, message: '必选项' }]}>
        <Select
          style={{ width: 100 }}
        >
          {weeks.map(week => (
            <Select.Option key={week}>{week}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    )

    if(models[this.props.selectValue]==='每小时'){
      selectShow=(
        <Fragment>
          { minuteSelect }
        </Fragment>
      )
    }
    if(models[this.props.selectValue]==='每天'){
      selectShow=(
        <Fragment>
          { hoursSelect }
        </Fragment>
      )
    }
    if(models[this.props.selectValue]==='每周'){
      selectShow=(
        <Fragment>
          { weekSelect }
          { hoursSelect }
        </Fragment>
      )
    }
    if(models[this.props.selectValue]==='每月'){
      selectShow=(
        <Fragment>
          { daySelect }
          { hoursSelect}
        </Fragment>
      )
    }
    return (
          <Space>
            <div>{this.props.selectValue}{this.props.index}</div>
            <Form.Item name={"model_" + this.props.index} noStyle rules={[{ required: true, message: '必选项' }]}>
              <Select
                style={{ width: 120 }}
                onChange={(value) => this.props.handleModelChange(value, this.props.index)}
                placeholder="Select time"
              >
              {models.map(model => (
              <Select.Option key={model}>{model}</Select.Option>
            ))}     
            </Select>
            </Form.Item>
            
          { selectShow }
          </Space>
    );
  }
}

const mapState = (state) => ({
  SelectTimeList: state.getIn(['deviceQuery', 'SelectTimeList']),
  SelectModelValue: state.getIn(['deviceQuery', 'SelectModelValue']),
  CurrentSelectTimeIndex: state.getIn(['deviceQuery', 'CurrentSelectTimeIndex']),
  
})

const mapDispatch = (dispatch) =>({
  handleModelChange(value, index){
    var modelSelectIndex = models.indexOf(value)
    var data = new Object()
    data["value"] = value
    data["index"] = index
    data["modelSelectIndex"] = modelSelectIndex
    dispatch(actionCreators.handleModelChange(data))
  },

  })

export default connect(mapState, mapDispatch)(SelectTime)