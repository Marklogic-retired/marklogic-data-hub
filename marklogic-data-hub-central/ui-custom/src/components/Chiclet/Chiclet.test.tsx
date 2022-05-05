import {render} from "@testing-library/react";
import Chiclet from "./Chiclet";

const config = {
  "colors": {
    "New York Times": "#d5e1de",
    "USA Today": "#ebe1fa",
    "Los Angeles Times": "#cae4ea",
    "Wall Street Journal": "#fae9d3",
    "Washington Post": "#fae3df",
    "Chicago Tribune": "#f0f6d9"
  },
  "path": "name"

}
const data = {
  name: "Chicago Tribune"
}
describe("Chiclet component", () => {
  test("Verify Chiclet is rendered with data property ", () => {
    const {getByTestId, getByText} = render(<Chiclet config={config} data={data} />);
    expect(getByTestId("chiclet-container")).toBeInTheDocument();
    expect(getByText("Chicago Tribune")).toBeInTheDocument();
    expect(getByTestId("chiclet-container")).toHaveStyle(`background-color: ${config.colors["Chicago Tribune"]}`);
  });
  test("Verify Chiclet is rendered with children property", () => {
    const {getByTestId, getByText} = render(<Chiclet config={config}>New York Times</Chiclet>);
    expect(getByTestId("chiclet-container")).toBeInTheDocument();
    expect(getByText("New York Times")).toBeInTheDocument();
    expect(getByTestId("chiclet-container")).toHaveStyle(`background-color: ${config.colors["New York Times"]}`);
  });
})