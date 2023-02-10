import React from "react";
import {render} from "@testing-library/react";
import DropDownWithSearch from "./dropdownWithSearch";
import data from "../../../assets/mock-data/curation/common.data";

describe("DropDownWithSearch component", () => {
  const minWidth = "168px;";
  const maxWidth = "400px;";

  test("DropDownWithSearch component renders ", () => {
    const {container} = render(<DropDownWithSearch {...data.dropDownWithSearch}
      setDisplayMenu={jest.fn()}
      onItemSelect={jest.fn()}
      srcData={[]}
      itemValue={""}
    />);
    expect(container.querySelector("#dropdownList-select-wrapper")).toBeInTheDocument();
  });

  test("DropDownWithSearch component has minWidth", () => {
    const {container} = render(<DropDownWithSearch {...data.dropDownWithSearch}
      setDisplayMenu={jest.fn()}
      onItemSelect={jest.fn()}
      srcData={[]}
      itemValue={""}
    />);
    expect(container.querySelector("#dropdownList-select-wrapper")).toHaveStyle("width: " + minWidth);
  });

  test("DropDownWithSearch component has maxWidth", () => {
    const {container} = render(<DropDownWithSearch {...data.dropDownWithSearch} indentList={[500, 500]}
      setDisplayMenu={jest.fn()}
      onItemSelect={jest.fn()}
      setDisplaySelectList={true}
      srcData={
        [
          {
            "value": "custOrderInfo:CustOrders",
            "key": "custOrderInfo:CustOrders",
            "struct": true
          }
        ]
      }
      itemValue={"hasshoe"}
    />);
    expect(container.querySelector("#dropdownList-select-wrapper")).toHaveStyle("width: " + maxWidth);
  });
});