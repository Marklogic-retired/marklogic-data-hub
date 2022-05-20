import React, { useState, useContext } from "react";
import { MetricsContext } from "../../store/MetricsContext";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Table from "react-bootstrap/Table";
import Highcharts from 'highcharts'
import highchartsMore from "highcharts/highcharts-more.js"
import solidGauge from "highcharts/modules/solid-gauge.js";
import HighchartsReact from 'highcharts-react-official'
import "./WhatsNew.scss";
import _ from "lodash";

type Props = {
  data?: any;
  config?: any
};

/**
 * Component for showing summary of new activity in application.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object[]} config  Array of configuration objects.
 * @example
 * TBD
 */
const WhatsNew: React.FC<Props> = (props) => {

  const metricsContext = useContext(MetricsContext);

  let selectedInit: string = "";

  let menuItems: any = [];
  if (props.config && props.config.menu && props.config.menu.length > 0) {
    menuItems = props.config.menu;
    let found = menuItems.find(item => item.default === true);
    selectedInit = found ? found.label : menuItems[0].label;
  }

  const [selected, setSelected] = useState<any>(selectedInit);

  // Get menu value (1440) for a selected menu label ("Last Week")
  const getMenuVal = sel => {
    let found = menuItems.find(item => item.label === sel);
    return found ? found.period : "";
  }

  const formatNumber = (data, path) => {
        let  result = _.get(data, path, null);
        return result ? parseInt(result).toLocaleString() : null;
  }

  const handleSelect = (e) => {
    setSelected(e);
    metricsContext.handleGetWhatsNew(getMenuVal(e));
  };

  const options = {
    chart: {
      type: "solidgauge",
      height: 200,
      width: 200,
      borderWidth: 0 //  NOTE setting as string causes "Error: <rect> attribute" errors
    },
    title: null,
    credits: {
        enabled: false
    },
    lang: {
        decimalPoint: '\u066B',
        thousandsSeparator: '\u066C'
    },
    pane: {
        center: ['50%', '50%'],
        size: '100%',
        startAngle: -180,
        endAngle: 180,
        background: {
            backgroundColor: '#eee',
            innerRadius: '65%',
            outerRadius: '100%',
            shape: 'arc',
            borderWidth: 0
        }
    },
    yAxis: {
      min: 0,
      max: 100,
      lineWidth: 0,
      tickPositions: [],
      minorTickInterval: null,
      majorTickInterval: null
    },
    plotOptions: {
      solidgauge: {
        dataLabels: {
          enabled: true
        },
        linecap: "round",
        stickyTracking: false,
        rounded: false
      }
    },
    tooltip: {
        enabled: false
    }, 
    series: [
      {
        type: "solidgauge",
        dataLabels: {
            align: 'center',
            enabled: false,
            rotation: 0,
            x: 0,
            y: -5,
            borderWidth: 0,
            style: {
                color: '#999',
                fontSize: '14px',
            },
            formatter: function () {
                    var self: any = this;
                    return Highcharts.numberFormat(self.y, 0, '', ',')
            },
        },
        animation: {
          duration: 500
        }
      }
    ]
  };

  if (!_.isEmpty(props.data)) {
    // Set options.series.data to create gauge parts
    let adjustment = 0;
    let total = _.sum(Object.values(props.data))
    options.series[0]["data"] = [];
    // Reversing puts first one at bottom, then clockwise
    props.config.items.reverse().forEach((item, i) => {
      let val = _.get(props.data, item.path, null);
      let normalized = 100 * (val/total);
      let chartVal = 100 - adjustment;
      adjustment = adjustment + normalized;
      options.series[0]["data"].push({
              color: item.color,
              radius: "100%",
              innerRadius: "65%",
              y: chartVal
      });
    })
  }

  return (
    <div className="whatsNew">
      
        <div className="chart" style={{zIndex: 1}}>
          <HighchartsReact
              highcharts={Highcharts}
              options={options}
          />
        </div>

        {props.config?.items?.length > 0 && props.config?.menu?.length > 0 &&
          <div className="content">

            <div className="menu">
              <DropdownButton
                title={selected}
                data-testid="whatsNewDropdown"
                id="whatsNewDropdown"
                onSelect={handleSelect}
              >
                {props.config.menu.map((n, i) => {
                  return <Dropdown.Item key={"item-" + i} eventKey={n.label}>{n.label}</Dropdown.Item>
                })}
              </DropdownButton>
            </div>

            <div className="legend">
              <Table>
                <tbody>
                  {props.config.items.map((item, i) => {
                    return <tr key={"row-" + i}>
                      <td className="bar"><div style={{"backgroundColor": item.color}}></div></td>
                      <td className="label">{item.label}</td>
                      <td className="value">{formatNumber(props.data, item.path)}</td>
                    </tr>
                  })}
                </tbody>
              </Table>
            </div>

          </div>}

    </div>
  );
};

export default WhatsNew;
