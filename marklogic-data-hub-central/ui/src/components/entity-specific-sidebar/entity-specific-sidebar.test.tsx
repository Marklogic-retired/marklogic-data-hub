import React from "react";
import {render} from "@testing-library/react";
import EntitySpecificSidebar from "./entity-specific-sidebar";


const ADDRESS = {name: "Address", color: "#CEE0ED", amount: 10, filter: 2, icon: "faUser"};

describe("Entity Specific Sidebar component", () => {
  it("can render base entity icons list only", () => {

    const {getByLabelText, getByText} =  render(
      <EntitySpecificSidebar
        entitySelected={ADDRESS}
      />
    );
    expect(getByLabelText("specif-sidebar-Address")).toBeInTheDocument();
    expect(getByLabelText("specif-icon-Address")).toBeInTheDocument();
    expect(getByLabelText("specif-title-Address")).toBeInTheDocument();
    expect(getByText("Address")).toBeInTheDocument();
  });

});