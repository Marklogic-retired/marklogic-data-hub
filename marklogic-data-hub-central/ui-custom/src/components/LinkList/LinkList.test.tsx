import {render, waitFor, fireEvent} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import LinkList from "./LinkList";

const configuration = {
  component: "LinkList",
  config: {
    id: "linkList",
    title: "Record Actions",
    arrayPath: "person.links.link",
    link: {
      icon: "icon",
      label: "label",
      url: "url"
    }
  }
}
const detail = {
  person: {
    links: {
      link: [
        {
          label: "Quick View",
          url: "https://boston.com",
          icon: "faEye"
        },
        {
          label: "Nomination History",
          url: "http://shutterfly.com",
          icon: "faMedal"
        },
        {
          label: "Comments",
          url: "http://auda.org.au",
          icon: "faComments"
        }
      ]
    }
  }
}
const detailContextValue = {
  detail: detail,
  handleDetail: jest.fn()
};

describe("LinkList component", () => {
  test("Verify LinkList widget renders correctly", () => {
    const {getByTestId,getByText} = render(
      <DetailContext.Provider value={detailContextValue}>
        <LinkList config={configuration.config} data={detail} />
      </DetailContext.Provider>
    );
    expect(getByTestId("link-List")).toBeInTheDocument();
    expect(getByText("Record Actions")).toBeInTheDocument();
    expect(getByText("Quick View")).toBeInTheDocument();
  });
  test("Verify LinkList widget expand and collapse correctly", () => {
    const {getByTestId,getByText, container} = render(
      <DetailContext.Provider value={detailContextValue}>
        <LinkList config={configuration.config} data={detail} />
      </DetailContext.Provider>
    );
    expect(getByText("Record Actions")).toBeInTheDocument();
    expect(getByTestId("link-List-data")).toHaveClass('collapse');
    fireEvent.click(getByTestId("link-List-button"));
    expect(getByTestId("link-List-data")).not.toHaveClass('collapse');

  });
});