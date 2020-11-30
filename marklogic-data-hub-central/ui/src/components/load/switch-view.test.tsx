import React from "react";
import {render, fireEvent, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import SwitchView from "./switch-view";

export type ViewType =  "card" | "list";

describe("Switch view component", () => {

  const INITIAL_VIEW: ViewType = "card";

  afterEach(cleanup);

  test("Verify styles of selected buttons", () => {

    const {getByLabelText} = render(
      <SwitchView handleSelection={() => null} defaultView={INITIAL_VIEW} />
    );

    expect(getByLabelText("switch-view")).toBeInTheDocument();

    expect(getByLabelText("switch-view-card")).toHaveProperty("checked", true);
    expect(getByLabelText("switch-view-list")).toHaveProperty("checked", false);
    fireEvent.mouseOver(getByLabelText("switch-view-list"));
    expect(getByLabelText("switch-view-list")).toHaveStyle("color: rgb(127, 134, 181");
    fireEvent.click(getByLabelText("switch-view-list"));
    expect(getByLabelText("switch-view-card")).toHaveProperty("checked", false);
    expect(getByLabelText("switch-view-list")).toHaveProperty("checked", true);
    fireEvent.mouseOver(getByLabelText("switch-view-card"));
    expect(getByLabelText("switch-view-card")).toHaveStyle("color: rgb(127, 134, 181");
  });

  test("Verify integrity of enter and arrow keys navigation", () => {

    const {getByLabelText} = render(
      <SwitchView handleSelection={() => null} defaultView={INITIAL_VIEW} />
    );

    expect(getByLabelText("switch-view")).toBeInTheDocument();
    getByLabelText("switch-view").firstChild.focus();

    // verify default selection
    expect(getByLabelText("switch-view-card")).toHaveProperty("checked", true);
    expect(getByLabelText("switch-view-list")).toHaveProperty("checked", false);

    // verify pressing enter switches the view to list
    fireEvent.keyDown(getByLabelText("switch-view"), {key: "Enter", code: "Enter"});
    expect(getByLabelText("switch-view-card")).toHaveProperty("checked", false);
    expect(getByLabelText("switch-view-list")).toHaveProperty("checked", true);

    // verify pressing enter again switches the view back to card
    fireEvent.keyDown(getByLabelText("switch-view"), {key: "Enter", code: "Enter"});
    expect(getByLabelText("switch-view-card")).toHaveProperty("checked", true);
    expect(getByLabelText("switch-view-list")).toHaveProperty("checked", false);

    // verify pressing right arrow when on card switches view to list
    fireEvent.keyDown(getByLabelText("switch-view"), {key: "ArrowRight", code: "ArrowRight"});
    expect(getByLabelText("switch-view-card")).toHaveProperty("checked", false);
    expect(getByLabelText("switch-view-list")).toHaveProperty("checked", true);

    // verify pressing right arrow when on list does not switch view
    fireEvent.keyDown(getByLabelText("switch-view"), {key: "ArrowRight", code: "ArrowRight"});
    expect(getByLabelText("switch-view-list")).toHaveProperty("checked", true);

    // verify pressing left arrow when on list switches view to card
    fireEvent.keyDown(getByLabelText("switch-view"), {key: "ArrowLeft", code: "ArrowLeft"});
    expect(getByLabelText("switch-view-card")).toHaveProperty("checked", true);
    expect(getByLabelText("switch-view-list")).toHaveProperty("checked", false);

    // verify pressing left arrow when on card does not switch view
    fireEvent.keyDown(getByLabelText("switch-view"), {key: "ArrowLeft", code: "ArrowLeft"});
    expect(getByLabelText("switch-view-card")).toHaveProperty("checked", true);
  });

});
