import React from "react";
import Footer from "./footer";

import userEvent from "@testing-library/user-event";
import {cleanup, render, screen} from "@testing-library/react";

describe("Footer component", () => {

  beforeAll(() => {
    cleanup();
  });

  it("should render correctly", () => {
    const infoRender = render(<Footer />);
    expect(infoRender.container.getElementsByClassName("footerContainer")).toHaveLength(1);
  });

  it("should display correct text", () => {
    const infoRender = render(<Footer />);
    const currentYear = (new Date()).getFullYear();
    let regex = new RegExp("© " + currentYear + " MarkLogic Corporation|Privacy");
    expect(infoRender.getAllByText(regex)).toHaveLength(2);
  });

  it("can focus and goto on privacy link", () => {

    global.window = {location: {href: null}};
    render(<Footer />);
    // get the actual link wrapper by traversing DOM tree

    expect(screen.getByText("Privacy")).toBeInTheDocument();

    userEvent.tab();
    expect(screen.getByText("Privacy").parentElement).toHaveFocus();

    // can set link wrapper to focus
    screen.getByText("Privacy").focus();
    expect(screen.getByText("Privacy")).toHaveFocus();
  });
});
