import React from "react";
import {render} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Tiles from "./tiles";
import {faCube} from "@fortawesome/free-solid-svg-icons";
import TestComponent from "../../assets/mock-data/test-component";
import {fireEvent} from "@testing-library/react";
import {SearchContext} from "../../util/search-context";
import {entityDefinitionsArray} from "../../assets/mock-data/modeling/modeling";
import {getQueriesResponse} from "../../assets/mock-data/explore/query";
import {searchContextInterfaceByDefault} from "@util/uiTestCommonInterface";

const color = "#000";
const text = "test";
const options = {
  title: text,
  iconType: "fa",
  icon: faCube,
  color: color,
  bgColor: color,
  border: color,
  controls: []
};

describe("Tiles component", () => {
  test("renders with a FontAwesome icon", () => {
    const {getByLabelText} = render(
      <Tiles
        id={text}
        view={<TestComponent />}
        currentNode={text}
        options={{...options}}
        onMenuClick={jest.fn()}
        onTileClose={jest.fn()}
        newStepToFlowOptions={jest.fn()}
      />
    );
    expect(getByLabelText("icon-" + text)).toBeInTheDocument();
    expect(getByLabelText("title-" + text)).toBeInTheDocument();
  });
  test("renders with a custom icon", () => {
    const localOptions = {
      iconType: "custom",
      icon: "exploreIcon",
    };
    const {getByLabelText} = render(
      <Tiles
        id={text}
        view={<TestComponent />}
        currentNode={text}
        options={{...options, ...localOptions}}
        onMenuClick={jest.fn()}
        onTileClose={jest.fn()}
        newStepToFlowOptions={jest.fn()}
      />
    );
    expect(getByLabelText("icon-" + text)).toBeInTheDocument();
    expect(getByLabelText("title-" + text)).toBeInTheDocument();
  });
  test("model tile lightbulb popover", () => {
    const title = "model";
    const localOptions = {
      ...options,
      title,
      iconType: "custom",
      icon: "exploreIcon",
    };
    const {getByLabelText, queryByLabelText} = render(
      <Tiles
        id={title}
        view={<TestComponent />}
        currentNode={title}
        options={localOptions}
        onMenuClick={jest.fn()}
        onTileClose={jest.fn()}
        newStepToFlowOptions={jest.fn()}
      />
    );
    expect(queryByLabelText("modelingInfo")).toBeNull();
    fireEvent.click(getByLabelText(`${title}InfoIcon`));
    expect(getByLabelText("modelingInfo")).toBeInTheDocument();
  });
  test("explore tile lightbulb popover", () => {
    const title = "explore";
    const localOptions = {
      ...options,
      title,
      iconType: "custom",
      icon: "exploreIcon",
    };
    const {getByLabelText, queryByLabelText} = render(
      <Tiles
        id={title}
        view={<TestComponent />}
        currentNode={title}
        options={localOptions}
        onMenuClick={jest.fn()}
        onTileClose={jest.fn()}
        newStepToFlowOptions={jest.fn()}
      />
    );
    expect(queryByLabelText(`${title}Info`)).toBeNull();
    fireEvent.click(getByLabelText(`${title}InfoIcon`));
    expect(getByLabelText(`${title}Info`)).toBeInTheDocument();
  });
  test("tile should render settings menu with all options disabled", () => {
    const title = "explore";
    const localOptions = {
      ...options,
      title,
      iconType: "custom",
      icon: "exploreIcon",
      controls: ["menu"]
    };
    const {getByLabelText} = render(
      <Tiles
        id={title}
        view={<TestComponent />}
        currentNode={title}
        options={localOptions}
        onMenuClick={jest.fn()}
        onTileClose={jest.fn()}
        newStepToFlowOptions={jest.fn()}
      />
    );
    expect(getByLabelText("explore-settings-menu")).toBeInTheDocument();
    fireEvent.click(getByLabelText("explore-settingsIcon-menu"));
    expect(getByLabelText("manageQueries")).toBeInTheDocument();
    expect(getByLabelText("manageQueries").parentElement).toHaveClass("disabled");
    expect(getByLabelText("entityTypeDisplaySettings")).toBeInTheDocument();
    expect(getByLabelText("entityTypeDisplaySettings").parentElement).toHaveClass("disabled");
  });
  test("tile should render settings menu with all options enabled", () => {
    const title = "explore";
    const localOptions = {
      ...options,
      title,
      iconType: "custom",
      icon: "exploreIcon",
      controls: ["menu"]
    };
    const {getByLabelText, debug} = render(
      <SearchContext.Provider value={{
        ...searchContextInterfaceByDefault,
        savedQueries: getQueriesResponse,
        entityDefinitionsArray
      }}>
        <Tiles
          id={title}
          view={<TestComponent />}
          currentNode={title}
          options={localOptions}
          onMenuClick={jest.fn()}
          onTileClose={jest.fn()}
          newStepToFlowOptions={jest.fn()}
        />
      </SearchContext.Provider>
    );
    expect(getByLabelText("explore-settings-menu")).toBeInTheDocument();
    fireEvent.click(getByLabelText("explore-settingsIcon-menu"));
    expect(getByLabelText("manageQueries")).toBeInTheDocument();
    debug(getByLabelText("explore-settings-menu"));
    expect(getByLabelText("manageQueries").parentElement).not.toHaveClass("disabled");
    expect(getByLabelText("entityTypeDisplaySettings")).toBeInTheDocument();
    expect(getByLabelText("entityTypeDisplaySettings").parentElement).not.toHaveClass("disabled");
  });
});
