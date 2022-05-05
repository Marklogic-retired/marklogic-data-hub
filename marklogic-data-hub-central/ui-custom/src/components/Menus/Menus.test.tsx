import {render, fireEvent, waitFor} from "@testing-library/react";
import { BrowserRouter as Router} from "react-router-dom";
import Menus from "./Menus";

const config = {
  "menus": [
    {
      "label": "Search",
      "to": "/search"
    },
    {
      "label": "ML Home",
      "url": "http://www.marklogic.com"
    },
    {
      "label": "Submenu",
      "submenu": [
        {
          "label": "ML Docs",
          "url": "https://docs.marklogic.com/"
        },
        {
          "label": "Search",
          "to": "/search"
        }
      ]
    }
  ]
}

describe("Menus component", () => {
  it("Verify Menus is rendered", async () => {
    const {getByTestId, getByText} = render(
      <Router>
        <Menus config={config.menus}/>
      </Router>
    )
    expect(getByTestId("menuId")).toBeInTheDocument();
    expect(getByText("ML Home")).toBeInTheDocument();
    expect(getByText("Submenu")).toBeInTheDocument();
    fireEvent.click(getByText("Submenu"));
    await waitFor(() => {
      expect(getByText("ML Docs")).toBeInTheDocument();
    });
  });
})