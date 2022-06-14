import Footer from "./footer";
import React from "react";
import {mount} from "enzyme";
import {fireEvent, render, wait, waitForElement} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Footer component", () => {
  let wrapper;

  beforeAll(() => {
    wrapper = mount(<Footer />);
  });

  it("should render correctly", () => {
    expect(wrapper.contains(<Footer />)).toBe(true);
  });

  it("should display correct text", () => {
    const currentYear = (new Date()).getFullYear();
    expect(wrapper.text()).toBe("© " + currentYear + " MarkLogic Corporation|Privacy");
  });

  it("can focus and goto on privacy link", () => {
    const {getByLabelText} = render(<Footer />)    

    // get the actual link wrapper by traversing DOM tree
    let privacyLink = getByLabelText("#privacy-link");
    expect(privacyLink.innerText).toBe("Privacy");
  });
});
