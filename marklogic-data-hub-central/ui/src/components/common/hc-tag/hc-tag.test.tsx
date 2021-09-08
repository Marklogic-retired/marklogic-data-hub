import React from "react";
import {render, screen, cleanup} from "@testing-library/react";
import styles from "../../../ruleset-multiple-modal.module.scss";
import {fireEvent} from "@testing-library/react";
import HCTag from "./hc-tag";

afterEach(() => {
  cleanup();
});

test("should render a Tag component ", () => {
  render(<HCTag label={"test tag"}>This is a tag check</HCTag>);
  const tagElement = screen.getByTestId("tag-component");
  expect(tagElement).toBeInTheDocument();
});
test("should render a customized Tag component ", () => {
  render(<HCTag label={"test tag"} color={"green"} closable={true} className={styles.matchOnTags} style={{fontSize: 10}} dashed={true}>This is a dashed, closable, custom color and with ClassName tag check</HCTag>);
  const tagElement = screen.getByTestId("tag-component");
  expect(tagElement).toBeInTheDocument();
});
test("should not render a Tag component ", () => {
  render(<HCTag label={"test tag"} visible={false} >This is a tag check, should not render it</HCTag>);
  const tagElement = screen.getByTestId("tag-component");
  expect(tagElement).toHaveClass("spanTagInvisible");
});
test("should click a Tag component after click close icon", () => {
  render(<HCTag label={"test tag"} >This is a tag check, should click the tag after click close icon</HCTag>);
  const closeIconTagElement = screen.getByTestId("iconClose-tagComponent");

  closeIconTagElement.onclick = jest.fn();
  fireEvent.click(closeIconTagElement);
  expect(closeIconTagElement.onclick).toHaveBeenCalledTimes(1);
});