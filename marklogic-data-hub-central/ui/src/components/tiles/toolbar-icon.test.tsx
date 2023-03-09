import React, {createRef} from "react";
import {Router} from "react-router";
import {createMemoryHistory} from "history";
const history = createMemoryHistory();
import {render, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ToolbarIcon from "./toolbar-icon";
import tiles from "../../config/tiles.config";

describe("Toolbar Icon test suite", () => {
  it("should render the enabled icon", () => {
    const ref = createRef();
    const onClick = jest.fn();
    const onKeyDown = jest.fn();

    const {getByLabelText} = render(
      <Router history={history}>
        <ToolbarIcon
          tile={tiles.load}
          tileId={"load"}
          tileRef={ref}
          i={1}
          isActive={false}
          enabled={true}
          onClick={onClick}
          onKeyDown={onKeyDown}
        />{" "}
      </Router>,
    );

    const icon = getByLabelText("tool-load");
    expect(icon).toBeInTheDocument();

    fireEvent.click(icon);
    expect(onClick).toBeCalled();
  });
  it("should render the icon disabled", () => {
    const ref = createRef();
    const onClick = jest.fn();
    const onKeyDown = jest.fn();

    const {getByLabelText} = render(
      <Router history={history}>
        <ToolbarIcon
          tile={tiles.load}
          tileId={"load"}
          tileRef={ref}
          i={1}
          isActive={false}
          enabled={false}
          onClick={onClick}
          onKeyDown={onKeyDown}
        />
      </Router>,
    );

    const icon = getByLabelText("tool-load");

    fireEvent.click(icon);
    expect(onClick).not.toBeCalled();
  });
});
