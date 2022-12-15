import React from "react";
import JsonView from "./json-view";
import MockDocument from "../../assets/mock-data/explore/json-document-payload";
import {render} from "@testing-library/react";


describe("Json view component", () => {
  test("renders", () => {
    const infoRender = render(<JsonView document={MockDocument}/>);
    expect(infoRender.container.getElementsByClassName("react-json-view")).toHaveLength(1);
  });
});
