import React, {useState} from "react";
import "./Timeline.scss";
import DateTime from "../DateTime/DateTime";
import Value from "../Value/Value";
import { getValByConfig } from "../../util/util";
import _ from "lodash";
import {default as TimelineVis} from "react-visjs-timeline";
import "./Timeline.scss";
import * as ReactDOMServer from 'react-dom/server';

type Props = {
    data?: any;
    config?: any;
};

const COMPONENTS = {
    DateTime: DateTime,
    Value: Value,
}

/**
 * Component for showing content on a timeline.
 *
 * @component
 * @prop {object} config - Data table configuration object.
 * @example
 */
const Timeline: React.FC<Props> = (props) => {

    let data: any = [];
    data = getValByConfig(props.data, props.config);
    data = _.isNil(data) ? null : (Array.isArray(data) ? data : [data]);
    const [minDate, setMinDate] = useState(new Date());
    const [maxDate, setMaxDate] = useState(new Date());

    let timelineData : any[]=[];

    const getItems = (d) => {
        let result = [];
        result = props.config.popover.items.map((item, index) => {
            if (!item) return null;
            return (<div className="popover-row" key={"item-" + index}>
                <span className="popover-label">{item.label}</span>
                {(item.component) ?
                    <span key={"item-" + index} className="popover-value">
                        {React.createElement(COMPONENTS[item.component],
                            { config: item.config, data: d, style: item.style}, null
                        )}
                    </span> :
                    <span><span key={"item-" + index} className="popover-value">
                        <Value data={d} config={item} getFirst={true}/>
                    </span></span>
                }
            </div>)
        })
        return result;
    }

    //To find min and max date range boundary for timeline
    const getMinMaxTime = (data) => {
        data?.map((activity) => {
             let date = activity.source.ts;

             let currItemDate = new Date(date);
             if(currItemDate < minDate) {
                 setMinDate(currItemDate);
             }
             else if(currItemDate > maxDate) {
                 setMaxDate(currItemDate);
             }
        })
        let boundaryRange = (maxDate.getTime() - minDate.getTime())/(1000 * 3600 * 24 * 30);
        minDate.setMonth(minDate.getMonth() - boundaryRange/20);
        maxDate.setMonth(maxDate.getMonth() + boundaryRange/20);
    }

    data?.map((activity, id) => {
        let obj={content: "", start: null, id: "", title: "", type:""};
        obj.content = _.get(activity, props.config.marker.path, null)
        obj.start = _.get(activity, props.config.popover.items[1].config.path, null)
        obj.id = _.get(activity, props.config.marker.path, null) + id;
        obj.title = ReactDOMServer.renderToString(
            <span>{getItems(data[id])}</span>)
        timelineData.push(obj);
    })

    getMinMaxTime(data);

    const timelineOptions:any = {
        start: new Date(minDate),
        end: new Date(maxDate),
        width: "100%",
        minHeight: "25vh",
        itemsAlwaysDraggable: {
            item: false,
            range: true
        },
        selectable: false,
        moveable: true,
        timeAxis: {
            scale: "month",
            step: 4
        },
        format: {
            minorLabels: function (date) {
                let month, year;
                month = date.format("MMM");
                // year = date.format("YYYY");
                // if(year === "2020")
                return month;
                // else return "";
            },
        },
        maxMinorChars: 4,
        tooltip: {
            followMouse: true,
            overflowMethod: "cap",
        },
    };

    const renderActivityTimeline = () => {
        return <div data-testid={"activity-info-timeline"}>
            <TimelineVis
                items={timelineData}
                options={timelineOptions}
                borderMargin="14px"
            />
        </div>;
    };

    return (
        <div className="timeline">
            {data && data.length > 0 && <div>
                {renderActivityTimeline()}
            </div>}
        </div>
    );
};

export default Timeline;