import React, { useState } from "react";
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

  const [selected, setSelected] = useState<any>("This Week");

  const handleSelect = (e) => {
    console.log(e);
    setSelected(e);
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

  // Set options.series.data to create gauge parts
  let adjustment = 0;
  let total = _.sum(_.map(props.data, "value"))
  options.series[0]["data"] = [];
  // Reversing puts first one at bottom, then clockwise
  props.data.slice().reverse().forEach((d, i) => {
    let normalized = 100 * (d.value/total);
    let chartVal = 100 - adjustment;
    adjustment = adjustment + normalized;
    options.series[0]["data"].push({
            color: d.color,
            radius: "100%",
            innerRadius: "65%",
            y: chartVal
    });
  })

  return (
    <div className="new">
      
        <div className="chart" style={{zIndex: 1}}>
          <HighchartsReact
              highcharts={Highcharts}
              options={options}
          />
        </div>

        <div className="content">

          <div className="menu">
            <DropdownButton
              title={selected}
              data-testid="whatsNewDropdown"
              id="whatsNewDropdown"
              onSelect={handleSelect}
            >
              {props.config.items.map((n, i) => {
                return <Dropdown.Item key={"item-" + i} eventKey={n.label}>{n.label}</Dropdown.Item>
              })}
            </DropdownButton>
          </div>

          <div className="legend">
            <Table>
              <tbody>
                {props.data.map((d, i) => {
                  return <tr key={"row-" + i}>
                    <td className="bar"><div style={{"backgroundColor": d.color}}></div></td>
                    <td className="label">{d.label}</td>
                    <td className="value">{d.value.toLocaleString()}</td>
                  </tr>
                })}
              </tbody>
            </Table>
          </div>

        </div>

    </div>
  );
};

export default WhatsNew;
