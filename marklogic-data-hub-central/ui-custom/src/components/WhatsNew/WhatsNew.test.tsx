import {render} from "@testing-library/react";
import {MetricsContext} from "../../store/MetricsContext";
import WhatsNew from "./WhatsNew";

// Required to support guage chart in component
import Highcharts from "highcharts/highcharts.js";
import highchartsMore from "highcharts/highcharts-more.js"
import solidGauge from "highcharts/modules/solid-gauge.js";
highchartsMore(Highcharts);
solidGauge(Highcharts);

const config = {
    "component": "WhatsNew",
    "config": {
      "items": [
        {
          "label": "Foo",
          "type": "foo",
          "path": "foo",
          "color": "#3CDBC0"
        },
        {
          "label": "Bar",
          "type": "bar",
          "path": "bar",
          "color": "#09ABDE"
        }
      ],
      "menu": [
        {
          "label": "Today",
          "period": 1440
        },
        {
          "label": "This Week",
          "period": 10080,
          "default": true
        }
      ]
    }
  }

const whatsNew = {
  "foo": 123,
  "bar": 4567890
};

const metricsContextValue = {
    metrics: {},
    whatsNew: whatsNew,
    handleGetMetrics: jest.fn(),
    handleGetWhatsNew: jest.fn()
};

describe("WhatsNew component", () => {
  test("Verify content renders with chart", () => {
    const {container, getByText, getByTestId} = render(
      <MetricsContext.Provider value={metricsContextValue}>
        <WhatsNew data={whatsNew} config={config.config} />
      </MetricsContext.Provider>
    );
    expect(getByText(config.config.menu[1].label)).toBeInTheDocument();
    expect(getByText(config.config.items[0].label)).toBeInTheDocument();
    expect(getByText(whatsNew.bar.toLocaleString())).toBeInTheDocument();
    expect(container.getElementsByClassName("highcharts-container").length).toBe(1);
  })
});