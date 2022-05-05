import React from "react";
import "./Section.scss";
import {ChevronDoubleDown, ChevronDoubleUp} from 'react-bootstrap-icons'
import RecentClear from "../RecentClear/RecentClear";

type Props = {
  title: string;
  width?: string;
  config?: any;
  collapsible?: boolean;
  expand?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
};

/**
 * Component for showing a container around one or more other components.
 *
 * @component
 * @prop {string} title Section label.
 * @prop {string} value Section width (as CSS width value, default to "100%").
 * @prop {object} config Configuration object.
 * @prop {object} config.style CSS style object applied to outer DIV container.
 * @prop {object} config.headerStyle CSS style object applied to inner HEADER container.
 * @prop {object} config.mainStyle CSS style object applied to inner MAIN container.
 * @example
 * <Section title="My Section Title" width="200px">
 *   <SomeComponent />
 * </Section>
 * 
 * Configuration object:
 * 
 * {
 *   "headerStyle": {
 *     "backgroundColor": "white"
 *   },
 *   "mainStyle": {
 *     "maxHeight": "500px"
 *   }
 * }
 */
const Section: React.FC<Props> = (props) => {

  let divStyle: any = {
    width: props.width ? props.width : "100%"
  };
  divStyle = props.config?.style ? Object.assign(props.config.style, divStyle) : divStyle;

  let headerStyle: any = props.config?.headerStyle ? props.config.headerStyle : {};
  let mainStyle: any = props.config?.mainStyle ? props.config.mainStyle : {};
  let expandClass = props?.expand ? 'expand' : 'collapse';

  const handleExpand = () => {
    if (props?.onExpand) {
      props.onExpand();
    }
  }
  const handleCollapse = () => {
    if (props?.onCollapse) {
      props.onCollapse();
    }
  }

  return (
    <div data-testid="sectionId" className="section" style={divStyle}>
      <header style={headerStyle}>
        <span className="title">{props.title}</span>
        {props.title === "Recently Visited" && <RecentClear title="recently visited record" type="recentRecords"></RecentClear>}
        {props.collapsible && <div className="collapse-container">
          <a data-testid="collapseButton" className="collapse-button" onClick={handleCollapse}><ChevronDoubleUp /></a>
          <a data-testid="expandButton" className="collapse-button" onClick={handleExpand}><ChevronDoubleDown /></a>
        </div>}
      </header>
      <main className={props.collapsible ? expandClass : ""} style={mainStyle}>{props.children}</main>
    </div>
  );
};

export default Section;
