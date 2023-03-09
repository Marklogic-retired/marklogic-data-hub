import {render, screen, cleanup, fireEvent} from "@testing-library/react";
import * as testUtils from "../../../util/test-utils";
import React from "react";
import {act} from "react-dom/test-utils";
import HCModal from "./hc-modal";

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("HC-Modal", () => {
  it("should render a HCModal component", () => {
    render(
      <HCModal show>
        <strong>Message</strong>
      </HCModal>,
    );
    const modalElement = screen.getByTestId("hc-modal-component");
    expect(modalElement).toBeInTheDocument();
  });

  it("should call onHide function when ESC key pressed", () => {
    const {getByTestId} = render(
      <HCModal show onHide={testUtils.onHideMock}>
        <strong>Message</strong>
      </HCModal>,
    );
    const onHideSpy = jest.spyOn(testUtils, "onHideMock");

    act(() => {
      fireEvent.keyDown(getByTestId("hc-modal-component"), {
        keyCode: 27,
        key: "Escape",
      });
    });
    expect(onHideSpy).toHaveBeenCalled();
  });
});
