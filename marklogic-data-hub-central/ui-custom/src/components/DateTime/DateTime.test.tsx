import {render} from "@testing-library/react";
import DateTime from "./DateTime";
const configWithoutFormat = {
  path: "ts"
}
const config = {
  format: "dd-MM-yyyy",
  path: "ts"
}
const data = {
  ts: "2011-06-17T07:26:39Z"
}
describe("DateTime component", () => {
  test("Verify DateTime is rendered with default format", () => {
    const {getByTestId, getByText} = render(<DateTime config={configWithoutFormat} data={data} />);
    expect(getByTestId("dateTimeContainer")).toBeInTheDocument();
    expect(getByText("2011-06-17")).toBeInTheDocument();
  });
  test("Verify DateTime is rendered with the format provided by the configuration", () => {
    const {getByTestId, getByText} = render(<DateTime config={config} data={data} />);
    expect(getByTestId("dateTimeContainer")).toBeInTheDocument();
    expect(getByText("17-06-2011")).toBeInTheDocument();
  });
  test("Verify DateTime is rendered with the format and style provided by properties", () => {
    const {getByTestId, getByText} = render(<DateTime config={config} data={data} style={{backgroundColor: "#d5e1de"}} />);
    expect(getByTestId("dateTimeContainer")).toBeInTheDocument();
    expect(getByText("17-06-2011")).toBeInTheDocument();
    expect(getByTestId("dateTimeContainer")).toHaveStyle(`background-color: #d5e1de`);
  });
})