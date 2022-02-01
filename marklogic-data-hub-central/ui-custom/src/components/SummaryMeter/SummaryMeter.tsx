import React, { useRef, useContext } from "react";
import { SearchContext } from "../../store/SearchContext";
import Highcharts from 'highcharts'
import highchartsMore from "highcharts/highcharts-more.js"
import solidGauge from "highcharts/modules/solid-gauge.js";
import HighchartsReact from 'highcharts-react-official'
import styles from "./SummaryMeter.module.scss";

highchartsMore(Highcharts);
solidGauge(Highcharts);

type Props = {
  data?: any;
  config?: any
};

// TODO Add needle by overlaying a second chart: https://jsfiddle.net/doc_snyder/j5owogor/

/**
 * Component for showing search summary values as a donut chart.
 *
 * @component
 * @prop {object} config  Configuration object.
 * @prop {object} config.colors  Color object.
 * @prop {string} config.colors.all  Color representing all results (HTML color).
 * @prop {string} config.colors.filters  Color representing results with filters applied (HTML color).
 * @see {@link https://www.highcharts.com/demo/gauge-solid|Highcharts Solid Gauge}
 * @example
 * {
 *   colors: {
 *     all: "#cccccc",
 *     filters: "#5fc9aa"
 *   }
 * }
 */
const SummaryMeter: React.FC<Props> = (props) => {

  const searchContext = useContext(SearchContext);

  // const chartComponentRef = useRef<HighchartsReact.RefObject>(null); // TODO required?

  const options = {
    chart: {
      type: "solidgauge",
      height: 180,
      width: 360,
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
        center: ['50%', '75%'],
        size: '100%',
        startAngle: -90,
        endAngle: 90,
        background: {
            backgroundColor: '#eee',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc',
            borderWidth: 0
        }
    },
    yAxis: {
      min: 0,
      max: searchContext.total,
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
        name: "Move",
        type: "solidgauge",
        data: [
          {
            color: props.config.colors.filters,
            radius: "100%",
            innerRadius: "60%",
            y: searchContext.returned
          }
        ],
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

  return (
    <div className={styles.meter}>
      <div style={{zIndex: 1}}>
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
            // ref={chartComponentRef} // TODO required?
        />
      </div>
      <div style={{zIndex: 1000}}>
        <div className={styles.labelAll}>
            <div className={styles.block} />
            <div className={styles.text}>All results</div>
        </div>
        <div className={styles.labelFilters}>
            <div className={styles.block} />
            <div className={styles.text}>With filters applied</div>
        </div>
        <div className={styles.min}>0</div>
        <div className={styles.max}>{searchContext.total}</div>
        
        <div className={styles.returned}>
            <div className={styles.separator} />
            <span>{searchContext.returned}</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryMeter;
