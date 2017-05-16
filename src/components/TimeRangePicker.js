import React from 'react';
import PropTypes from 'prop-types';

var time_labels = [];
export default class TimeRangePicker extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            index : -1,
            lastIndex : -1,
            startIndex : -1,
            endIndex : -1,
            start : '',
            end : '',
            isSelecting : false,
            isMouseOver : false,
        };

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    handleMouseMove(e){
        let {index} = getCurrentTimeBox(e, this.props);
        let isMouseOver = true;

        //the last empty box or disabled box(es)
        if(index === -1 || this.refs['refs-'+index].props.isDisabled) isMouseOver = false;
        
        this.setState({
            index,
            isMouseOver
        });
    }

    handleMouseClick(e){
        let {index} = getCurrentTimeBox(e, this.props);
        // reset state values
        let startIndex = -1, 
            endIndex = -1, 
            lastIndex = -1,
            start = '', 
            end = '',
            isSelecting = false;

        //the last empty box OR disabled box(es)
        if(index === -1 || this.refs['refs-'+index].props.isDisabled) return false;

        //1) set values
        if(!isSelecting && ((this.state.startIndex !== this.state.endIndex) 
            || (this.state.startIndex === -1 && this.state.endIndex === -1))){
            startIndex = endIndex = lastIndex = index;
            isSelecting = true;
        }else if(index == this.state.lastIndex){
            isSelecting = false;
        }else{
            startIndex = (this.state.lastIndex < index)? this.state.lastIndex : index;
            endIndex = (this.state.lastIndex < index)? index : this.state.lastIndex;
            isSelecting = false;
        }

        if(startIndex !== -1 && endIndex !== -1){
            start = this.getTimeRangeText("start", startIndex);
            end = this.getTimeRangeText("end", endIndex);
        }

        this.setState({
            index,
            startIndex,
            endIndex,
            start,
            end,
            lastIndex,
            isSelecting,
            isMouseOver : true,
        });
    }

    handleMouseLeave(e){
        let {index} = getCurrentTimeBox(e, this.props);
        
        this.setState({
            index,
            isMouseOver : false,
        });
    }

    getFormattedTime(d){ 
        return ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2);
    }

    getTimeRangeText(category, index){
        if(index === -1) return false; 
        return (category == "start")? time_labels[index] : time_labels[index + 1];
    }

    render(){
        /* 
         * unit : time unit                 = e.g. 1 or 30 (1: 1 hour, 30: 30 min)
         * available : business hours       = e.g. {start: '10:00', end: '22:00'}
         * unavailable : unavailable time      = e.g. [{start:'15:00', end:'16:00'}, {start:'17:00', end:'18:00'}]
         * ////// limit : the number of selectable boxes = e.g. 3 (not yet)/////
         */
        let {unit, available, unavailable, style} = this.props;
        let unavailableStart = [], unavailableEnd = [];

        // 1) get business hours
        let opening = setTimetoDate(available.start),
            closing = (opening.getTime() - setTimetoDate(available.end).getTime() >= 0)? setTimetoDate(available.end, true) : setTimetoDate(available.end);
        let business_hours = (Math.abs(opening.getTime() - closing.getTime())/1000/3600).toFixed(2); 

        /* 
         * 2) get box counts
         * unit 1 : Integer count (+ 1 -- if its decimal isn't 0)
         * unit 30 : Integer count * 2 (+ 1 -- if its decimal isn't 0)
        */
        let time_unit = (unit == 1)? 1 : 2,
            tmp_hour = Math.floor(business_hours),
            tmp_min = (business_hours - tmp_hour !== 0)? 1 : 0;

        let cnt_timebox = (tmp_hour * time_unit) + tmp_min;

        // 3) draw time boxes
        let obj_timebox = [], 
            obj_timebox_label = [],
            tmp_time_1 = new Date(opening),
            tmp_time_2 = tmp_time_1,
            {isMouseOver, startIndex, endIndex, isSelecting, index, lastIndex} = this.state;

        // -- sort disabled data 
        unavailable.sort((a,b)=>{
            return a.start < b.start ? -1 : a.start > b. start ? 1 : 0;
        });

        for (let i=0; i<=cnt_timebox; i++){
            // set time for timebox (hour or minute)
            if(i != 0){
                (unit == 1)? tmp_time_1.setHours(tmp_time_1.getHours() + unit) : tmp_time_1.setMinutes(tmp_time_1.getMinutes() + unit);
            }
            //label 
            time_labels[i] = (i === cnt_timebox)? this.getFormattedTime(closing) : this.getFormattedTime(tmp_time_1);
            
            if(unit == 1 || (unit == 30 && i%2 == 0)){
                if(unit == 1 || (unit == 30 && i === cnt_timebox)) obj_timebox_label.push(<td className="time-range-picker-label" key={`time-label-${i}`}> {time_labels[i]}</td>);
                else obj_timebox_label.push(<td className="time-range-picker-label" key={`time-label-${i}`} colSpan='2'> {time_labels[i]}</td>);
            }
            
            // ----- timebox
            // isDisabled
            let isDisabled = false;
            let time_label = setTimetoDate(time_labels[i]).getTime();
            unavailable.forEach((time, k)=>{
                if( (time_label - setTimetoDate(time.start).getTime() >= 0) && (time_label - setTimetoDate(time.end).getTime() < 0) ){
                    isDisabled = true;
                    return;
                }
            });
            // isActive
            let isActive = false;
            if (!isDisabled && ((isSelecting && i == startIndex)
            || (!isSelecting && (i >= startIndex && i <= endIndex) && (startIndex != -1 && endIndex != -1)))){
                isActive = true;
            }
            // willBeActive 
            let willBeActive = false;
            if (isMouseOver && !isActive && !isDisabled && 
                ((isSelecting && ((index > lastIndex && i > lastIndex && i <= index) || (index < lastIndex && i < lastIndex && i >= index))) || (!isSelecting && i == index))){
                willBeActive = true;
            }

            let timeBoxProps = {
                isDisabled, 
                isActive,
                willBeActive, //mouse over
                key: `timebox-${i}`,
                ref: `refs-${i}`
            }

            if (i != cnt_timebox) obj_timebox.push(<TimeRangeBox {...timeBoxProps}/>);
            else obj_timebox.push(<td key={timeBoxProps.key}></td>);
        }

        // change css attributes(width) as box counts
        let tmp_width = (cnt_timebox > 39)? "lg" : (cnt_timebox > 19)? "md" : "sm";
        
        return (
            <div className="time-range-picker-wrap">
                <div className={"time-range-picker-value"}>
                    Time : {(this.state.start==='')?'00:00':this.state.start} - {(this.state.end==='')?'00:00':this.state.end}
                </div>
                <table className={"time-range-picker-table"} data-width={tmp_width}>
                    <tbody>
                        <tr className="time-range-picker time-range-picker-timebox"
                            onMouseEnter={this.handleMouseEnter}
                            onMouseLeave={this.handleMouseLeave}
                            onMouseMove={this.handleMouseMove}
                            onClick={this.handleMouseClick}>{obj_timebox}</tr>
                        <tr className="time-range-picker time-range-picker-labels">{obj_timebox_label}</tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

TimeRangePicker.defaultProps = {
    unit: 1,
    available : {opening: '09:00', closing:'22:00'},
    style : {}
};

TimeRangePicker.propTypes = {
    unit: PropTypes.number.isRequired,
    available : PropTypes.object.isRequired,
    unavailable: PropTypes.array.isRequired,
    limit : PropTypes.number,
    style: PropTypes.object
};

function getCurrentTimeBox(e, props){ 
    let Allboxes = Array.apply(null, e.currentTarget.childNodes),
        AllLabels = Array.apply(null, e.currentTarget.nextSibling.childNodes),
        box = findTimeBox(e.target, Allboxes, e.currentTarget),
        index = Allboxes.indexOf(box);

    index = (index == Allboxes.length-1)? -1 : index;

    return {
        index
    }
}

function findTimeBox(box, boxes, container){
    while(box !== container && boxes.indexOf(box) === -1) {
        box = box.parentNode;
    }
    return box;
}

function setTimetoDate(time, next){
    let date = (next)? "1990-03-23" : "1990-03-22";
    
    return new Date(date + " "+time);
}

/* Time Box Component */
class TimeRangeBox extends React.Component {
    constructor(props) {
        super(props);
	}

    render() {
        let nameMap = {
			isDisabled : 'is-disabled',
			isActive : 'is-active',
			willBeActive : 'will-be-active'
		};

        let className = Object.keys(nameMap)
			.filter((prop) => this.props[prop])
			.map((prop) => nameMap[prop])
			.join(' ');

        return (
            <td className={"time-range-picker-box " + className}></td>
        );
    }
}

TimeRangeBox.defaultProps = {
	isDisabled : false,
	isActive : false,
	willBeActive : false
}

TimeRangeBox.propTypes  = {
	isDisabled : PropTypes.bool,
	isActive   : PropTypes.bool,
	willBeActive : PropTypes.bool
}