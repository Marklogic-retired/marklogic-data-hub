import React from "react";
import {Router} from "react-router";
import {createMemoryHistory} from "history";
import userEvent from "@testing-library/user-event";
import {render, fireEvent} from "@testing-library/react";
import Overview from "./Overview";
import overviewConfig from "../config/overview.config";

describe("Overview component", () => {

  it("Verify content display", async () => {

    const {getByText, getByLabelText} = render(<Overview/>);

    expect(getByLabelText("overview")).toBeInTheDocument();

    expect(getByText("Welcome to MarkLogic Data Hub Central")).toBeInTheDocument();
    expect(getByLabelText("introText")).toBeInTheDocument();
    expect(getByText("Load")).toBeInTheDocument();
    expect(getByLabelText("load-icon")).toBeInTheDocument();
    expect(getByText("Model")).toBeInTheDocument();
    expect(getByLabelText("model-icon")).toBeInTheDocument();
    expect(getByText("Curate")).toBeInTheDocument();
    expect(getByLabelText("curate-icon")).toBeInTheDocument();
    expect(getByText("Run")).toBeInTheDocument();
    expect(getByLabelText("run-icon")).toBeInTheDocument();
    expect(getByText("Explore")).toBeInTheDocument();
    expect(getByLabelText("explore-icon")).toBeInTheDocument();

  });

  it("Verify enabled cards are clickable and have appropriate styling/content", async () => {

    const history = createMemoryHistory();
    history.push("/tiles"); // initial state

    let enabled = ["load", "model", "curate", "run", "explore"];
    const {getByLabelText, queryAllByText} = render(<Router history={history}><Overview enabled={enabled}/></Router>);

    enabled.forEach((card, i) => {
      expect(getByLabelText(card + "-card")).toHaveClass(`enabled`);
      fireEvent.click(getByLabelText(card + "-card"));
      expect(history.location.pathname).toEqual(`/tiles/${card}`);
    });
    // NO cards have permissions warning
    expect(queryAllByText("*additional permissions required")).toHaveLength(0);
  });

  it("Verify disabled cards are not clickable and have appropriate styling/content", async () => {

    const history = createMemoryHistory();
    history.push("/tiles"); // initial state

    let disabled = ["load", "model", "curate", "run", "explore"];
    const {getByLabelText, getAllByText} = render(<Router history={history}><Overview enabled={[]}/></Router>);

    disabled.forEach((card, i) => {
      expect(getByLabelText(card + "-card")).toHaveClass(`disabled`);
      fireEvent.click(getByLabelText(card + "-card"));
      expect(history.location.pathname).toEqual(`/tiles`); // no change
    });
    // ALL cards have permissions warning
    expect(getAllByText("*additional permissions required")).toHaveLength(disabled.length);

  });

  it("Verify enter key on each card goes to the appropriate link", async () => {

    const history = createMemoryHistory();
    history.push("/tiles");

    let enabled = ["load", "model", "curate", "run", "explore"];
    const {getByLabelText} = render(<Router history={history}><Overview enabled={enabled}/></Router>);

    enabled.forEach((id, i) => {
      let card = getByLabelText(id + "-card");
      card.focus();
      expect(card).toHaveFocus();
      fireEvent.keyDown(card, {key: "Enter", code: "Enter"});
      expect(history.location.pathname).toEqual(`/tiles/${id}`);
    });

  });

  it("Verify tab key navigation", async () => {

    let i: number;

    // todo
    const history = createMemoryHistory();
    history.push("/tiles");

    let enabled = ["load", "model", "curate", "run", "explore"];
    const {getByLabelText} = render(<Router history={history}><Overview enabled={enabled}/></Router>);

    getByLabelText("load-card").focus();
    expect(getByLabelText("load-card")).toHaveFocus();

    // pressing tab should consecutively highlight load -> model -> curate -> run -> explore
    for (i = 1; i < 5; ++i) {
      userEvent.tab();
      expect(getByLabelText(enabled[i] + "-card")).toHaveFocus();
    }

    // shift tab should reverse directions
    for (i = 3; i >= 0; --i) {
      userEvent.tab({shift: true});
      expect(getByLabelText(enabled[i] + "-card")).toHaveFocus();
    }
  });

  it("Verify arrow key navigation", async () => {

    // todo
    const history = createMemoryHistory();
    history.push("/tiles");

    let enabled = ["load", "model", "curate", "run", "explore"];
    const {getByLabelText} = render(<Router history={history}><Overview enabled={enabled}/></Router>);

    // map of which card to go next if up/down/left/right arrow keys are pressed on a card
    const directionMap = {
      "load": ["load",         "run",          "load",         "model"],
      "model": ["model",        "run",          "load",         "curate"],
      "curate": ["curate",       "run",          "model",        "explore"],
      "run": ["load",         "run",          "run",          "explore"],
      "explore": ["explore",      "explore",      "curate",       "explore"],
    };

    // directions in the same order as map above
    const directions =  ["ArrowUp",      "ArrowDown",    "ArrowLeft",    "ArrowRight"];

    enabled.forEach((id, i) => {
      directions.forEach((dir, j) => {

        let card = getByLabelText(id + "-card");

        card.focus();
        expect(card).toHaveFocus();

        fireEvent.keyDown(card, {key: dir, code: dir});
        expect(getByLabelText(directionMap[id][j] + "-card")).toHaveFocus();

      });
    });

  });

  it("Verify Documentation and Video Tutorial links", async () => {

    const history = createMemoryHistory();
    history.push("/tiles"); // initial state

    let enabled = ["load", "model", "curate", "run", "explore"];
    const {getAllByText} = render(<Router history={history}><Overview enabled={enabled}/></Router>);

    // Mock method for opening links
    const mockedWindowOpen = jest.fn();
    const originalOpen = window.open;
    window.open = mockedWindowOpen;

    // Check Documentation links
    const documentationLinks = getAllByText("Documentation");
    expect(documentationLinks.length === enabled.length); // All cards should have Documentation links
    documentationLinks.forEach((docLink, i) => {
      fireEvent.click(docLink);
      expect(mockedWindowOpen).toBeCalledWith(overviewConfig.documentationLinks[enabled[i]], "_blank");
    });

    // Check Video Tutorial links
    const videoLinks = getAllByText("Video Tutorial");
    expect(videoLinks.length === enabled.length); // All cards should have Video Tutorial links
    videoLinks.forEach((vidLink, i) => {
      fireEvent.click(vidLink);
      expect(mockedWindowOpen).toBeCalledWith(overviewConfig.videoLinks[enabled[i]], "_blank");
    });

    // Reset mocked method
    window.open = originalOpen;
  });

});
