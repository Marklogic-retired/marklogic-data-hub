import React, {useState} from "react";
import "./Timeline.scss";
import Concat from "../Concat/Concat";
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
    Concat: Concat,
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

    data?.map((activity, id) => {
        let obj={content: "", start: null, id: "", title: "", type:""};
        obj.content = _.get(activity, props.config.marker.label.path, null)
        obj.start = _.get(activity, props.config.marker.ts.path, null)
        obj.id = _.get(activity, props.config.marker.label.path, null) + id;
        obj.title = ReactDOMServer.renderToString(
            <span>{getItems(data[id])}</span>)
        timelineData.push(obj);
    })

    let minDate = new Date(), maxDate = new Date, currItemDate;
    data?.map((activity) => {
        let date = _.get(activity, props.config.marker.ts.path, null);

        currItemDate = new Date(date);
        if(currItemDate < minDate) {
            minDate = currItemDate;
        }
        else if(currItemDate > maxDate) {
            maxDate = currItemDate;
        }
    })
    let boundaryRange = (maxDate.getTime() - minDate.getTime())/(1000 * 3600 * 24 * 30);
    minDate.setMonth(minDate.getMonth() - boundaryRange/20);
    maxDate.setMonth(maxDate.getMonth() + boundaryRange/20);

    let timelineOptions: any = {
        minHeight: "25vh",
        maxMinorChars: 6,
        tooltip: {
            followMouse: true,
            overflowMethod: "cap",
        },
        zoomFriction: 10,
        zoomMax: 2153600000000,
        zoomMin: 600000000,
    };
    // Any option overrides from config
    timelineOptions = Object.assign(timelineOptions, props?.config?.options);

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