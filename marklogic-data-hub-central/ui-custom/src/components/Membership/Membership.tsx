import React from "react";
import "./Membership.scss";
import {Check, X} from "react-bootstrap-icons";
import _ from "lodash";
import {getValByPath, getValByConfig} from "../../util/util";
import DateTime from "../DateTime/DateTime";

type Props = {
  data?: any;
  config?: any;
  style?: React.CSSProperties
};

/**
 * Component for showing one or more values for a Membership view.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object} config  Membership configuration object.
 * @example
 * {
      "component": "Relationships",
      "config": {
        "arrayPath": "person.memberships.membership",
        "dateFormat": "yyyy-MM-dd",
        "iconSize": 30,
        "status": {
          "path": "important"
        },
        "ts": {
          "path": "ts"
        },
        "lists": [
          "list1",
          "list2",
          "list3",
          "list4",
          "list5",
          "list6",
          "list7",
          "list8",
          "list9",
          "list10",
          "list11",
          "list12"
        ]
      }
    }
 */
const Membership: React.FC<Props> = (props) => {
  const {data, config} = props;
  const iconSize = config.iconSize ? config.iconSize : 30;
  const {ts, status} = config;
  const getItems = () => {
    let memberships = getValByConfig(data, config);
    memberships = _.isNil(memberships) ? null : (Array.isArray(memberships) ? memberships : [memberships]);
    let membershipStyle: React.CSSProperties = props.style ? props.style : props.config?.style ? props.config.style : {};
    const items = config?.lists?.map((list, index) => {
      const membership = memberships?.find(el => el?.list.toLowerCase() === list.toLowerCase());
      const tsValue = ts?.path ? getValByPath(membership, ts?.path) : null;
      const statusValue = status?.path ? getValByPath(membership, status?.path) : false;
      const important = statusValue === true;
      const classes = important ? "item highlighted" : membership ? "item success" : "item";
      return (
        <div key={index} className={classes} style={membershipStyle}>
          <span className="title">{list}</span>
          <span className="icon" data-testid="icon-container">
            {membership ? <Check data-testid="success-icon" color="#97e7d7" size={iconSize} /> : <X data-testid="error-icon" color="#a2a2a2" size={iconSize} />}
          </span>
          {tsValue ? <span className="date"><DateTime config={{"format": props.config.dateFormat ? props.config.dateFormat : "dd-MM-yyyy"}}>{tsValue}</DateTime></span> : <span className="empty date"></span>}

        </div>
      );
    });
    return items && items.length > 0 ? items : null;
  };
  return (
    <div className="Membership" data-testid="membership-component">
      {
        getItems()
      }
    </div>);
};

export default Membership;