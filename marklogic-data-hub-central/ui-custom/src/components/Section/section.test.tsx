import {render, fireEvent} from "@testing-library/react";
import Section from "./Section";

describe("Section component", () => {
  it("Verify Section is rendered", () => {
    const {getByTestId, getByText} = render(<Section title="Section title"><span>section content</span></Section>);
    expect(getByTestId("sectionId")).toBeInTheDocument();
    expect(getByText("Section title")).toBeInTheDocument();
    expect(getByText("section content")).toBeInTheDocument();
  });
  it("Verify Section callbacks are executed", () => {
    const onExpandMock = jest.fn();
    const onCollapseMock = jest.fn();
    const {getByTestId} = render(<Section title="Section title" collapsible={true} onCollapse={onCollapseMock} onExpand={onExpandMock}><span>section content</span></Section>);
    expect(getByTestId("sectionId")).toBeInTheDocument();
    fireEvent.click(getByTestId("collapseButton"));
    expect(onCollapseMock).toHaveBeenCalled()
    fireEvent.click(getByTestId("expandButton"));
    expect(onExpandMock).toHaveBeenCalled()

  });
})