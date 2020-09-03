export const serviceIp = '10.1.107.28:8000'

export const models = ["每小时", "每天", "每周", "每月"]
export const weeks = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期天"]

export const minutes = []
export const days = [];
export const hours = [];

for(let i = 0; i <= 60; i=i+5){
  minutes.push(i.toString())
}

for(let i = 1; i < 29; i++){
  days.push(i.toString() + "号")
}

for (let i = 0; i < 24; i++) {
  for(let j = 0; j < 60; j=j+15){
    hours.push(i.toString()+":"+j.toString())
 }
}

export const weeks_obj = {
  "1": "星期一",
  "2": "星期二",
  "3": "星期三",
  "4": "星期四",
  "5": "星期五",
  "6": "星期六",
  "7": "星期天",
}