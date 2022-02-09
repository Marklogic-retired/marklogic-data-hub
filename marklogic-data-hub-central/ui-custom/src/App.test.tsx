import {render, act} from "@testing-library/react";
import App from "./App";

test("Renders application title", async () => {
  let getByText;
  await act(async () => {
      const renderResults = render(<App />);
      getByText = renderResults.getByText;
  });
  // TODO add tests
  // expect(getByText("Twizzlers-UI")).toBeInTheDocument();
});