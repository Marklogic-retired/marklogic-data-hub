import React from "react";
import {Router} from "react-router";
import {createMemoryHistory} from "history";
const history = createMemoryHistory();
import userEvent from "@testing-library/user-event";
import {render, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Toolbar from "./toolbar";
import tiles from "../../config/tiles.config";


describe("Toolbar component", () => {

  it("renders with clickable tools", () => {
    const tools = Object.keys(tiles);
    const {getByLabelText} = render(<Router history={history}><Toolbar tiles={tiles} enabled={tools}/></Router>);

    expect(getByLabelText("toolbar")).toBeInTheDocument();

    tools.forEach((tool, i) => {
      expect(getByLabelText("tool-" + tool)).toBeInTheDocument();
      fireEvent.click(getByLabelText("tool-" + tool));
      expect(history.location.pathname).toEqual(`/tiles/${tool}`);
    });

  });

  it("verify rendering of disabled tile icons", () => {
    let disabledTiles = ["load", "model", "curate", "run", "explore", "monitor"];
    const {getByLabelText} = render(<Router history={history}><Toolbar tiles={tiles} enabled={[]}/></Router>);
    expect(getByLabelText("toolbar")).toBeInTheDocument();

    disabledTiles.forEach((tile, i) => {
      expect(getByLabelText("tool-" + tile)).toHaveStyle("color: grey; opacity: 0.5; cursor: not-allowed;");
    });
  });

  it("verify rendering of enabled tile icons", () => {
    let enabledTiles = ["load", "model", "curate", "run", "explore"];
    const {getByLabelText} = render(<Router history={history}><Toolbar tiles={tiles} enabled={enabledTiles}/></Router>);
    expect(getByLabelText("toolbar")).toBeInTheDocument();

    enabledTiles.forEach((tile, i) => {
      expect(getByLabelText("tool-" + tile)).not.toHaveStyle("color: grey; opacity: 0.5; cursor: not-allowed;");
      expect(getByLabelText("tool-" + tile)).toHaveStyle("cursor: pointer;");
    });
  });

  it("verify tile icon selection using tab", () => {
    let i: number;
    let enabledTiles = ["load", "model", "curate", "run", "explore"];
    const {getByLabelText} = render(<Router history={history}><Toolbar tiles={tiles} enabled={enabledTiles}/></Router>);
    expect(getByLabelText("toolbar")).toBeInTheDocument();

    // focus on load tool
    getByLabelText("tool-load-link").focus();
    expect(getByLabelText("tool-load-link")).toHaveFocus();

    // press tab and verify each tool is selected in turn
    for (i = 1; i < 5; ++i) {
      userEvent.tab();
      expect(getByLabelText("tool-" + enabledTiles[i] + "-link")).toHaveFocus();
    }

    // press shift+tab and verify focus reverses direction
    for (i = 3; i >= 0; --i) {
      userEvent.tab({shift: true});
      expect(getByLabelText("tool-" + enabledTiles[i] + "-link")).toHaveFocus();
    }
  });


  it("verify tile icon selection using arrow keys", () => {
    let i: number;
    let enabledTiles = ["load", "model", "curate", "run", "explore", "monitor"];
    const {getByLabelText} = render(<Router history={history}><Toolbar tiles={tiles} enabled={enabledTiles}/></Router>);
    expect(getByLabelText("toolbar")).toBeInTheDocument();

    // focus on load tool
    getByLabelText("tool-load-link").focus();
    expect(getByLabelText("tool-load-link")).toHaveFocus();

    // pressing up arrow while on load does nothing (cannot go further up)
    fireEvent.keyDown(getByLabelText("tool-load-link"), {key: "ArrowUp", code: "ArrowUp"});
    expect(getByLabelText("tool-load-link")).toHaveFocus();

    // pressing down arrow sequentially moves focus down
    for (i = 1; i < 6; ++i) {
      fireEvent.keyDown(getByLabelText("tool-" + enabledTiles[i-1] + "-link"), {key: "ArrowDown", code: "ArrowDown"});
      expect(getByLabelText("tool-" + enabledTiles[i] + "-link")).toHaveFocus();
    }

    // pressing down arrow while on explore does nothing (cannot go further down)
    fireEvent.keyDown(getByLabelText("tool-monitor-link"), {key: "ArrowDown", code: "ArrowDown"});
    expect(getByLabelText("tool-monitor-link")).toHaveFocus();

    // pressing up arrow sequentially moves focus up
    for (i = 3; i >= 0; --i) {
      fireEvent.keyDown(getByLabelText("tool-" + enabledTiles[i+1] + "-link"), {key: "ArrowUp", code: "ArrowUp"});
      expect(getByLabelText("tool-" + enabledTiles[i] + "-link")).toHaveFocus();
    }
  });

});
