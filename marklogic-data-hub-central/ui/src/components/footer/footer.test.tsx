import React from "react";
import {mount} from "enzyme";
import Footer from "./footer";

import userEvent from "@testing-library/user-event";

describe("Footer component", () => {
  let wrapper;

  beforeAll(() => {
    wrapper = mount(<Footer />);
  });

  it("should render correctly", () => {
    expect(wrapper.exists(".ant-layout-footer")).toBe(true);
  });

  it("should display correct text", () => {
    const currentYear = (new Date()).getFullYear();
    expect(wrapper.text()).toBe("© " + currentYear + " MarkLogic Corporation|Privacy");
  });

  it("can focus and goto on privacy link", () => {

    global.window = {location: {href: null}};

    // get the actual link wrapper by traversing DOM tree
    let privacyLink = wrapper.childAt(0).childAt(0).childAt(0).childAt(0).childAt(2);
    expect(privacyLink.text()).toBe("Privacy");

    // can set link wrapper to focus
    privacyLink.getDOMNode().focus();
    expect(privacyLink.is(":focus")).toBe(true);

    // can tab to link wrapper from another element
    wrapper.getDOMNode().focus();
    userEvent.tab();
    expect(privacyLink.is(":focus")).toBe(true);
  });
});
