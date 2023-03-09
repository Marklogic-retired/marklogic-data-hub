import React from "react";
import {render, cleanup} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {fireEvent, configure} from "@testing-library/react";
import HCPopoverSearch from "./hc-popover-search";

configure({testIdAttribute: "id"});

afterEach(() => {
  cleanup();
});

const props = {
  onSearch: jest.fn(),
  onReset: jest.fn(),
  defaults: {
    // input props
    inputValue: "",
    inputId: "hc-popover-search-input",
    inputAriaLabel: "hc-popover-search-input",
    inputPlaceholder: "Search",
    // dialog props
    popoverId: "hc-popover-search",
    popoverAriaLabel: "hc-popover-search",
    // icon props
    searchIconId: "hc-popover-search-search-icon",
    searchIconAriaLabel: "hc-popover-search-search-icon",
    // button search props
    searchButtonText: "Search",
    searchButtonId: "hc-popover-search-search-button",
    // button reset props
    resetButtonText: "Reset",
    resetButtonId: "hc-popover-search-reset-button",
  },
  customs: {
    // input props
    inputValue: "Customer",
    inputId: "custom-input-id",
    inputAriaLabel: "custom-input-aria-label",
    inputPlaceholder: "Search Text",
    // dialog props
    popoverId: "custom-popover-id",
    popoverAriaLabel: "custom-popover-aria-label",
    // icon props
    searchIconId: "custom-search-icon-id",
    searchIconAriaLabel: "custom-search-icon-aria-label",
    // button search props
    searchButtonText: "Search Button Text",
    searchButtonId: "custom-search-button-id",
    // button reset props
    resetButtonText: "Reset Button Text",
    resetButtonId: "custom-reset-button-id",
  },
};

test("should render a HCPopoverSearch component", () => {
  const {getByTestId, queryByTestId} = render(
    <HCPopoverSearch inputValue={props.defaults.inputValue} onSearch={props.onSearch} onReset={props.onReset} />,
  );
  expect(getByTestId(props.defaults.searchIconId)).toBeInTheDocument();
  expect(queryByTestId(props.defaults.popoverId)).toBeNull();
});

test("should open the popover on click hover over search icon", () => {
  const {getByTestId, getByLabelText} = render(
    <HCPopoverSearch inputValue={props.defaults.inputValue} onSearch={props.onSearch} onReset={props.onReset} />,
  );
  fireEvent.click(getByTestId(props.defaults.searchIconId));
  expect(getByLabelText(props.defaults.searchIconAriaLabel)).toBeInTheDocument();

  expect(getByTestId(props.defaults.popoverId)).toBeInTheDocument();
  expect(getByLabelText(props.defaults.popoverAriaLabel)).toBeInTheDocument();

  expect(getByTestId(props.defaults.inputId)).toBeInTheDocument();
  expect(getByTestId(props.defaults.inputId)).toHaveProperty("placeholder", props.defaults.inputPlaceholder);
  expect(getByTestId(props.defaults.inputId)).toHaveValue("");
  expect(getByLabelText(props.defaults.inputAriaLabel)).toBeInTheDocument();

  expect(getByTestId(props.defaults.resetButtonId)).toBeInTheDocument();
  expect(getByTestId(props.defaults.resetButtonId)).toHaveTextContent(props.defaults.resetButtonText);

  expect(getByTestId(props.defaults.searchButtonId)).toBeInTheDocument();
  expect(getByTestId(props.defaults.searchButtonId)).toHaveTextContent(props.defaults.searchButtonText);
});

test("should render with personalized optional props", () => {
  const {getByTestId, getByLabelText} = render(
    <HCPopoverSearch
      inputValue={props.customs.inputValue}
      onSearch={props.onSearch}
      onReset={props.onReset}
      inputId={props.customs.inputId}
      inputAriaLabel={props.customs.inputAriaLabel}
      inputPlaceholder={props.customs.inputPlaceholder}
      popoverId={props.customs.popoverId}
      popoverAriaLabel={props.customs.popoverAriaLabel}
      searchIconId={props.customs.searchIconId}
      searchIconAriaLabel={props.customs.searchIconAriaLabel}
      searchButtonText={props.customs.searchButtonText}
      searchButtonId={props.customs.searchButtonId}
      resetButtonText={props.customs.resetButtonText}
      resetButtonId={props.customs.resetButtonId}
    />,
  );

  fireEvent.click(getByTestId(props.customs.searchIconId));
  expect(getByLabelText(props.customs.searchIconAriaLabel)).toBeInTheDocument();

  expect(getByTestId(props.customs.popoverId)).toBeInTheDocument();
  expect(getByLabelText(props.customs.popoverAriaLabel)).toBeInTheDocument();

  expect(getByTestId(props.customs.inputId)).toBeInTheDocument();
  expect(getByTestId(props.customs.inputId)).toHaveProperty("placeholder", props.customs.inputPlaceholder);
  expect(getByTestId(props.customs.inputId)).toHaveValue(props.customs.inputValue);
  expect(getByLabelText(props.customs.inputAriaLabel)).toBeInTheDocument();

  expect(getByTestId(props.customs.resetButtonId)).toBeInTheDocument();
  expect(getByTestId(props.customs.resetButtonId)).toHaveTextContent(props.customs.resetButtonText);

  expect(getByTestId(props.customs.searchButtonId)).toBeInTheDocument();
  expect(getByTestId(props.customs.searchButtonId)).toHaveTextContent(props.customs.searchButtonText);
});

test("can enter value to search and interact with search and reset button", () => {
  const {getByTestId, queryByTestId} = render(
    <HCPopoverSearch inputValue={props.defaults.inputValue} onSearch={props.onSearch} onReset={props.onReset} />,
  );
  fireEvent.click(getByTestId(props.defaults.searchIconId));
  userEvent.type(getByTestId(props.defaults.inputId), props.customs.inputValue);
  expect(getByTestId(props.defaults.inputId)).toHaveValue(props.customs.inputValue);
  fireEvent.click(getByTestId(props.defaults.searchButtonId));
  expect(queryByTestId(props.defaults.popoverId)).toBeNull();
  expect(props.onSearch).toHaveBeenCalledTimes(1);

  // reopen and check the input have the props.custom.inputValue inside
  fireEvent.click(getByTestId(props.defaults.searchIconId));
  expect(getByTestId(props.defaults.inputId)).toHaveValue(props.customs.inputValue);

  // click reset button and check that the popover goes close
  fireEvent.click(getByTestId(props.defaults.resetButtonId));
  expect(queryByTestId(props.defaults.popoverId)).toBeNull();
  expect(props.onReset).toHaveBeenCalledTimes(1);

  // reopen and check the input it's empty
  fireEvent.click(getByTestId(props.defaults.searchIconId));
  expect(getByTestId(props.defaults.inputId)).toHaveValue("");
});

test("popover should close when clicked outside", () => {
  const {getByTestId, queryByTestId} = render(
    <HCPopoverSearch inputValue={props.defaults.inputValue} onSearch={props.onSearch} onReset={props.onReset} />,
  );
  fireEvent.click(getByTestId(props.defaults.searchIconId));
  expect(getByTestId(props.defaults.popoverId)).toBeInTheDocument();

  fireEvent.click(document);
  expect(queryByTestId(props.defaults.popoverId)).toBeNull();
});

test("popover should not close when clicked outside passing prop closeOnClickOutside on false", () => {
  const {getByTestId} = render(
    <HCPopoverSearch
      inputValue={props.defaults.inputValue}
      onSearch={props.onSearch}
      onReset={props.onReset}
      closeOnClickOutside={false}
    />,
  );
  fireEvent.click(getByTestId(props.defaults.searchIconId));
  expect(getByTestId(props.defaults.popoverId)).toBeInTheDocument();

  fireEvent.click(document);
  expect(getByTestId(props.defaults.popoverId)).toBeInTheDocument();
});

test("keyboard navigation on popover search", () => {
  const {getByTestId, getByLabelText} = render(
    <HCPopoverSearch
      inputValue={props.defaults.inputValue}
      onSearch={props.onSearch}
      onReset={props.onReset}
      closeOnClickOutside={false}
    />,
  );
  let searchIcon = getByTestId(props.defaults.searchIconId);
  searchIcon.focus();
  fireEvent.keyDown(searchIcon, {key: "Enter", code: "Enter", keyCode: 13, charCode: 13});
  expect(getByTestId(props.defaults.popoverId)).toBeInTheDocument();

  let j: number;
  let inputBox = getByLabelText(props.defaults.inputAriaLabel);
  let searchButton = getByTestId(props.defaults.searchButtonId);
  let resetButton = getByTestId(props.defaults.resetButtonId);
  const popoverSearchActions = [inputBox, resetButton, searchButton];

  userEvent.tab();

  // verify elements tab in given order
  for (j = 0; j < 3; ++j) {
    userEvent.tab();
    expect(popoverSearchActions[j]).toHaveFocus();
  }

  // verify elements tab in reverse order
  userEvent.tab({shift: true});
  expect(resetButton).toHaveFocus();
});
