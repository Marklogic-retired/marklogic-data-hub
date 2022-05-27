import React from "react";
import {render, cleanup} from "@testing-library/react";
import HCFacetIndicator from "./hc-facet-indicator";

const config = {
  style: {
    width: "50px",
    height: "8px",
    overflow: "hidden"
  },
  activeColor: "#1acca8",
  inactiveColor: "#dddddd"
};

const propsData = {
  identifier: "customId",
  percentage: 50,
};

const ariaLabelPostfixes = {
  component: "-hc-facet-indicator",
  barWrapper: "-bar-wrapper",
  bar: "-bar",
};

afterEach(() => {
  cleanup();
});

test("should render a HCFacetIndicator component with default props", () => {
  const {getByLabelText} = render(<HCFacetIndicator percentage={propsData.percentage} />);
  expect(getByLabelText(`default${ariaLabelPostfixes.component}`)).toHaveStyle({...config.style});
  expect(getByLabelText(`default${ariaLabelPostfixes.component}`)).toBeInTheDocument();
  expect(getByLabelText(`default${ariaLabelPostfixes.barWrapper}`)).toBeInTheDocument();
  expect(getByLabelText(`default${ariaLabelPostfixes.bar}`)).toBeInTheDocument();
  expect(getByLabelText(`default${ariaLabelPostfixes.bar}`)).toHaveStyle({width: `${propsData.percentage}%`, backgroundColor: config.inactiveColor});
});

test("should have active color when pass isActive prop on true", () => {
  const {getByLabelText} = render(<HCFacetIndicator percentage={propsData.percentage} isActive />);
  expect(getByLabelText(`default${ariaLabelPostfixes.component}`)).toBeInTheDocument();
  expect(getByLabelText(`default${ariaLabelPostfixes.bar}`)).toHaveStyle({backgroundColor: config.activeColor});
});

test("should render modified aria-label when pass identifier prop", () => {
  const {getByLabelText} = render(<HCFacetIndicator percentage={propsData.percentage} identifier={propsData.identifier} />);
  expect(getByLabelText(`${propsData.identifier}${ariaLabelPostfixes.component}`)).toBeInTheDocument();
  expect(getByLabelText(`${propsData.identifier}${ariaLabelPostfixes.barWrapper}`)).toBeInTheDocument();
  expect(getByLabelText(`${propsData.identifier}${ariaLabelPostfixes.bar}`)).toBeInTheDocument();
});