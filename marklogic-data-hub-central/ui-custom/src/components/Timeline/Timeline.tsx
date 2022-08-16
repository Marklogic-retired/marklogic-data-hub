import React from "react";
import "./Timeline.scss";
import Concat from "../Concat/Concat";
import DateTime from "../DateTime/DateTime";
import Value from "../Value/Value";
import { getValByPath, getValByConfig } from "../../util/util";
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

    let data: any = [], items : any[]=[];

    const getPopover = (d, popoverConfig) => {
        let result = [];
        result = popoverConfig.items.map((item, i) => {
            if (!item) return null;
            return (<div className="popover-row" key={"item-" + i}>
                <span className="popover-label">{item.label}</span>
                {(item.component) ?
                    <span key={"item-" + i} className="popover-value">
                        {React.createElement(COMPONENTS[item.component],
                            { config: item.config, data: d, style: item.style}, null
                        )}
                    </span> :
                    <span><span key={"item-" + i} className="popover-value">
                        <Value data={d} config={item} getFirst={true}/>
                    </span></span>
                }
            </div>)
        })
        return result;
    }

    // Cycle through timeline sets
    const markerSets = _.isArray(props.config.markers) ? props.config.markers : [props.config.markers];
    let minDate = new Date(), maxDate = new Date, currItemDate;
    markerSets.forEach(markerSet => {
        data = getValByConfig(props.data, markerSet);
        data = _.isNil(data) ? null : (Array.isArray(data) ? data : [data]);
        data?.map((d, i) => {
            const item={};
            item['content'] = getValByPath(d, markerSet.label.path, true);
            item['start'] = getValByPath(d, markerSet.start.path, true);
            item['end'] = markerSet.end?.path ? getValByPath(d, markerSet.end.path, true) : null;
            item['id'] = getValByPath(d, markerSet.label.path, true) + i;
            item['style'] = markerSet.style ? markerSet.style : 'background-color: #D4DEFF;';
            item['title'] = ReactDOMServer.renderToString(
                <span>{getPopover(d, markerSet.popover)}</span>)
            items.push(item);
        })
        data?.map((d) => {
            let date = getValByPath(d, markerSet.start.path);
            currItemDate = new Date(date);
            if(currItemDate < minDate) {
                minDate = currItemDate;
            }
            else if(currItemDate > maxDate) {
                maxDate = currItemDate;
            }
        })
    });

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

    return (
        <div className="timeline">
            {data && data.length > 0 && <div data-testid={"activity-info-timeline"}>
                <TimelineVis
                    items={items}
                    options={timelineOptions}
                    borderMargin="14px"
                />
            </div>}
        </div>
    );
};

export default Timeline;