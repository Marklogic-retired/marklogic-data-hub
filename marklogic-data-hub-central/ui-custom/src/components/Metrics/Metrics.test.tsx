import {render} from "@testing-library/react";
import {MetricsContext} from "../../store/MetricsContext";
import Metrics from "./Metrics";

const config = {
    "component": "Metrics",
    "config": {
        "items": [
          {
            "title": "Foo metric",
            "type": "foo",
            "path": "foo",
            "period": 1440,
            "color": "#70d8c1"
          },
          {
            "title": "Bar metric",
            "type": "bar",
            "path": "bar",
            "period": 0,
            "color": "#f5d881"
          }
        ]
    }
  }

const metrics = {
  "foo": 123,
  "bar": 4567890
};

const metricsContextValue = {
    metrics: metrics,
    whatsNew: {},
    handleGetMetrics: jest.fn(),
    handleGetWhatsNew: jest.fn()
};

describe("Metrics component", () => {
  test("Verify content renders", () => {
    const {container, getByText, getByTestId} = render(
      <MetricsContext.Provider value={metricsContextValue}>
        <Metrics data={metrics} config={config.config} />
      </MetricsContext.Provider>
    );
    expect(getByText(config.config.items[0].title)).toBeInTheDocument();
    expect(getByText(metrics.bar.toLocaleString())).toBeInTheDocument();
    expect(container.getElementsByClassName("metric")[0].style.borderColor).toBe(config.config.items[0].color);
  })
});