import React from 'react';
import TimeRangePicker from './components/TimeRangePicker';

export default class App extends React.Component {
    render(){

        return (
            <div>
                <h1> Time Range Picker DEMO </h1>
                <TimeRangePicker 
                    unit={30} 
                    available={{start: '08:00', end: '23:00'}} 
                    unavailable={[{start:'09:30', end:'10:30'}, {start:'15:00', end:'20:00'}]} />
            </div>
        );
    }
}