import React from "react";
import {render} from "@testing-library/react";
import EntityIconsSidebar from "./entity-icons-sidebar";

const ADDRESS = {name: "Address", color: "#CEE0ED", amount: 10, filter: 2, icon: "faUser"};
const BACK_ACCOUNT = {name: "Bank Account", color: "#FDC7D4", amount: 10, filter: 2, icon: "faPiggyBank"};
const SPORTS = {name: "Sports", color: "#E3DEEB", amount: 599, icon: "faVolleyballBall"};
const WORK = {name: "Work", color: "#C9EBC4", amount: 9000, icon: "faPrint"};
const CUSTOMERS = {name: "Customers", color: "#D5D3DD", amount: 100, filter: 1, icon: "faShoppingCart"};

const currentBaseEntities: any = [ADDRESS, BACK_ACCOUNT, SPORTS];
const currentRelatedEntities: Map<string, any> = new Map([["work", WORK], ["Customers", CUSTOMERS]]);


describe("Entity Icons Sidebar component", () => {
  it("can render base entity icons list only", () => {

    const {getByLabelText, queryByText, getAllByLabelText} =  render(
      <EntityIconsSidebar
        currentBaseEntities={currentBaseEntities}
        onClose={jest.fn()}
        updateSelectedEntity={jest.fn()}
      />
    );

    expect(getByLabelText("base-entity-icons-list")).toBeInTheDocument();
    const relatedEntities = queryByText("related-entity-icons-list");
    expect(relatedEntities).toBeNull();
    const entities = getAllByLabelText(/base-entity-icon-/);
    expect(entities.length).toEqual(3);
  });

  it("can render also related entity icons list", () => {

    const {getByLabelText, getAllByLabelText} =  render(
      <EntityIconsSidebar
        currentBaseEntities={currentBaseEntities}
        currentRelatedEntities={currentRelatedEntities}
        onClose={jest.fn()}
        updateSelectedEntity={jest.fn()}
      />
    );

    expect(getByLabelText("related-entity-icons-list")).toBeInTheDocument();
    const entities = getAllByLabelText(/related-entity-icon-/);
    expect(entities.length).toEqual(2);
  });

});