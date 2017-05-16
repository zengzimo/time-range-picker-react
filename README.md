# time-range-picker-react
Time range picker for react

![Time_Range_Picker_Demo](/assets/Time-Range-Picker-Demo.gif)

## Sources
* Component 소스 
    - src/components/TimeRangePicker.js
* CSS 소스
    - public/styles/timeRangePicker.css
    - css-loader 나 style-loader 사용하셔도 되나 DEMO라서 그냥 html에서 로드하도록 함.

## Props
* unit
    * 의미 : Time Box 단위 
    * 타입 : Number
    * 값 종류 : 1 또는 30 (1은 1시간, 30은 30분)
* available
    * 의미 : 시간 범위
    * 타입 : Object - {start: .., end: ..}
    * ```{start: "08:00", end: "09:00"}```
* unavailable 
    * 의미 : 선택 불가 시간 범위 
    * 타입 : Array - [{start: .., end: ..}, ..]
    * ```[{start: "01:00", end: "02:00"}, {start:"05:00", end:"06:30"}]```

## Example
```
<TimeRangePicker 
    unit={30} 
    available={{start: '08:00', end: '23:00'}} 
    unavailable={[{start:'09:30', end:'10:30'}, {start:'15:00', end:'20:00'}]} />
```