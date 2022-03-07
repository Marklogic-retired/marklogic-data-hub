import {render} from "@testing-library/react";
import {DetailContext} from "../../store/DetailContext";
import Membership from "./Membership";

const configMultiple = {
  component: "Relationships",
  config: {
    arrayPath: "person.memberships.membership",
    iconSize: 35,
    "lists": [
      "list1",
      "list2",
      "list3",
      "list4",
      "list5",
      "list6",
      "list7",
      "list8",
      "list9",
      "list10",
      "list11",
      "list12"
    ]
  }
}

const detail = {
  person: {
    memberships: {
      membership: [
        {
          "list": "list2",
          "important": "true",
          "ts": "2021-07-31"
        },
        {
          "list": "list11",
          "important": "true",
          "ts": "2020-04-20"
        },
        {
          "list": "list10",
          "important": "true",
          "ts": "2019-10-26"
        },
        {
          "list": "list8",
          "important": "true",
          "ts": "2022-02-16"
        },
        {
          "list": "list3",
          "important": "false",
          "ts": "2021-03-11"
        }
      ]
    }
  }
}

const detailContextValue = {
  detail: detail,
  handleDetail: jest.fn()
};


describe("Membership component", () => {
  test("Verify Membership widget renders", () => {
    const {getByText, getByTestId, getAllByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <Membership config={configMultiple.config} data={detail} />
      </DetailContext.Provider>
    );
    expect(getByTestId("membership-component")).toBeInTheDocument();
    expect(getByText("list3")).toBeInTheDocument();
    expect(getAllByTestId("icon-container")).toHaveLength(12);
    expect(getAllByTestId("success-icon")).toHaveLength(5);
    expect(getAllByTestId("error-icon")).toHaveLength(7);
  })
  test("Verify Membership widget renders with a list of checked membership", () => {
    const {getByText, getByTestId, getAllByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <Membership config={configMultiple.config} data={detail} />
      </DetailContext.Provider>
    );
    expect(getByTestId("membership-component")).toBeInTheDocument();
    expect(getByText("list12")).toBeInTheDocument();
    expect(getAllByTestId("success-icon")).toHaveLength(5);
  })
  test("Verify Membership widget renders with a list of not checked membership", () => {
    const {getByText, getByTestId, getAllByTestId} = render(
      <DetailContext.Provider value={detailContextValue}>
        <Membership config={configMultiple.config} data={{}} />
      </DetailContext.Provider>
    );
    expect(getByTestId("membership-component")).toBeInTheDocument();
    expect(getByText("list10")).toBeInTheDocument();
    expect(getAllByTestId("icon-container")).toHaveLength(12);
    expect(getAllByTestId("error-icon")).toHaveLength(12);
  })
});