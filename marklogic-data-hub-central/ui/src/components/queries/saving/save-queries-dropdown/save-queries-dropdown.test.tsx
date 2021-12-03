import React from "react";
import {render} from "@testing-library/react";
import SaveQueryDropdown from "./save-queries-dropdown";



describe("<SaveQueryDropdown/>", () => {


  test("Save query dropdown renders without crashing", async () => {
    const {getByText} = render(<SaveQueryDropdown
      savedQueryList={[]}
      toggleApply={jest.fn()}
      getSaveQueryWithId ={jest.fn()}
      greyFacets= {[]}
      currentQueryName={""}
      setCurrentQueryName={jest.fn()}
      currentQuery={{}}
      setSaveNewIconVisibility={jest.fn()}
      setSaveChangesIconVisibility={jest.fn()}
      setDiscardChangesIconVisibility={jest.fn()}
      setSaveChangesModal={jest.fn()}
      setNextQueryName={jest.fn()}
      isSaveQueryChanged={jest.fn()}
    />);

    expect(getByText("select a query")).toBeInTheDocument();
  });

});
