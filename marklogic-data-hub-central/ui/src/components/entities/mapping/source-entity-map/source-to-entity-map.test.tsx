import React from 'react';
import { render, cleanup, fireEvent, within } from '@testing-library/react';
import SourceToEntityMap from './source-to-entity-map';
import data from '../../../../config/data.config';
import { shallow } from 'enzyme';
import SplitPane from 'react-split-pane';
import { validateMappingTableRow } from '../../../../util/test-utils';

describe('RTL Source-to-entity map tests', () => {
    afterEach(cleanup);
    test('RTL tests with no source data', () => {
        const { getByTestId,  getByText, getByRole } = render(<SourceToEntityMap {... {mapData: data.mapProps.mapData, entityTypeTitle : data.mapProps.entityTypeTitle, sourceData: [], extractCollectionFromSrcQuery: jest.fn()}} mappingVisible={true}/>);
        expect(getByText('Source Data')).toBeInTheDocument();
        expect(getByText('Test')).toBeDisabled;
        expect(getByText('Clear')).toBeDisabled;
        expect(getByTestId("entityContainer")).toBeInTheDocument();
        expect(getByTestId("srcContainer")).toBeInTheDocument();
        expect(getByText("Unable to find source documents using the specified collection or query.")).toBeInTheDocument;
        expect(getByTestId("srcContainer")).toHaveClass("sourceContainer");
        expect(getByText('Entity: Person')).toBeInTheDocument();
        expect(getByRole('presentation').className).toEqual("Resizer vertical ");
    });

    test('RTL tests with source data',  () => {
        const { getByTestId,  getByText,container, queryByText } = render(<SourceToEntityMap {...data.mapProps}  mappingVisible={true}/>);
        expect(getByText('Source Data')).toBeInTheDocument();
        expect(getByText('proteinId')).toBeInTheDocument();
        expect(getByTestId("entityContainer")).toBeInTheDocument();
        expect(getByTestId("srcContainer")).toBeInTheDocument();
        expect(getByTestId("srcContainer")).toHaveClass("sourceContainer");
        expect(getByText('Entity: Person')).toBeInTheDocument();
        expect(getByText('Test')).toBeEnabled();
        expect(queryByText("Unable to find source documents using the specified collection or query.")).not.toBeInTheDocument();
        let exp = getByText('testNameInExp');
        expect(exp).toBeInTheDocument();
        fireEvent.change(exp, { target: {value: "concat(name,'-NEW')" }});
        fireEvent.blur(exp);
        fireEvent.click(getByText('Clear'));
        expect(getByText('Clear')).toBeEnabled();
        expect(getByText("concat(name,'-NEW')")).toBeInTheDocument();
    });

    test('Filtering Name column in Source and Entity tables',() => {
      
      const { getByText,getByTestId,queryByText } = render(<SourceToEntityMap {...data.mapProps} 
        mappingVisible={true} 
        />);

      /* Test filter on Source table  */
      let filterIcon = getByTestId('filterIcon-key');
      expect(filterIcon).toBeInTheDocument();
      fireEvent.click(filterIcon);
      let inputSearch = getByTestId('searchInput-key');
      expect(inputSearch).toBeInTheDocument();
      fireEvent.change(inputSearch, { target: {value: "first" }}); //Enter a case-insensitive value in inputSearch field
      expect(getByTestId('submitSearch-key')).toBeInTheDocument();
      expect(inputSearch).toHaveValue('first');
      fireEvent.click(getByTestId('submitSearch-key')); //Click on Search button to apply the filter with the desired string
      
      //Check if the expected values are available/not available in search result.
      expect(getByText('nutFreeName')).toBeInTheDocument();
      expect(getByText('NamePreferred')).toBeInTheDocument();
      expect(getByText('John')).toBeInTheDocument();
      expect(queryByText('proteinId')).not.toBeInTheDocument(); 
      expect(queryByText('proteinType')).not.toBeInTheDocument();

      //Check if the entity properties are not affected by the filter on source table
      expect(getByText('propId')).toBeInTheDocument();
      expect(getByText('propName')).toBeInTheDocument();
      expect(getByText('artCraft')).toBeInTheDocument();
      expect(getByText('automobile')).toBeInTheDocument();

      //Reset the search filter on Source table
      fireEvent.click(filterIcon);
      let resetSearch = getByTestId('ResetSearch-key');
      fireEvent.click(resetSearch);

      //Check if the expected values are present now after resetting the filter on source table.
      expect(getByText('proteinId')).toBeInTheDocument();
      expect(getByText('proteinType')).toBeInTheDocument();
      
      /* Test filter on Entity table  */

      //Updating expression for few fields to be validated later
      let exp = getByText('testNameInExp');
      fireEvent.change(exp, { target: {value: "concat(propName,'-NEW')" }});
      fireEvent.blur(exp);
      expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument();

      //Moving along with the filter test
      let entityfilterIcon = getByTestId('filterIcon-name');
      fireEvent.click(entityfilterIcon);
      let inputSearchEntity = getByTestId('searchInput-name');
      fireEvent.change(inputSearchEntity, { target: {value: "craft" }}); //Enter a case-insensitive value in inputEntitySearch field
      expect(getByTestId('submitSearch-name')).toBeInTheDocument();
      expect(inputSearchEntity).toHaveValue('craft');
      fireEvent.click(getByTestId('submitSearch-name')); //Click on Search button to apply the filter with the desired string

      //Check if the expected values are available/not available in search result.
      expect(getByText('items')).toBeInTheDocument();
      expect(getByText('itemTypes')).toBeInTheDocument();
      expect(getByText('itemCategory')).toBeInTheDocument();
      expect(getByText('Craft')).toBeInTheDocument();
      expect(queryByText('propId')).not.toBeInTheDocument(); 
      expect(queryByText('propName')).not.toBeInTheDocument();

      //Check if the source table properties are not affected by the filter on Entity table
      expect(getByText('proteinId')).toBeInTheDocument();
      expect(getByText('proteinType')).toBeInTheDocument();
      expect(getByText('FirstNamePreferred')).toBeInTheDocument();
      expect(getByText('LastName')).toBeInTheDocument();

       //Reset the search filter on Entity table
       fireEvent.click(entityfilterIcon);
       let resetEntitySearch = getByTestId('ResetSearch-name');
       fireEvent.click(resetEntitySearch);
 
       //Check if the expected values are present now after resetting the filter on Entity table.
       expect(getByText('propId')).toBeInTheDocument();
       expect(getByText('propName')).toBeInTheDocument();
    });

    test('Column option selector in Entity table',() => {
      
      const { getByText,getByTestId } = render(<SourceToEntityMap {...data.mapProps} 
        mappingVisible={true}
        />);

      //Set the data for testing in xpath expression

      let exp = getByText('testNameInExp');
      fireEvent.change(exp, { target: {value: "concat(propName,'-NEW')" }});
      fireEvent.blur(exp);
      expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument();
      
      /* Test column option selector in Entity table  */
      let colOptSelect = getByText('Column Options');
      fireEvent.click(colOptSelect);
      let Name = getByTestId('columnOptionsCheckBox-name');
      let Type = getByTestId('columnOptionsCheckBox-type');
      let XPathExpression = getByTestId('columnOptionsCheckBox-key');
      let Value = getByTestId('columnOptionsCheckBox-value');
      expect(Name).toBeChecked();
      expect(Type).toBeChecked();
      expect(XPathExpression).toBeChecked();
      expect(Value).toBeChecked();

      fireEvent.click(Name); //Uncheck Name column
      let colHeader:any = getByTestId('entityTableType').closest('tr');
      let entityTableHeaderRow = within(colHeader);
      expect(entityTableHeaderRow.queryByText('Name')).not.toBeInTheDocument();

      //Verifying edge case where xpath expression rows for the filtered out names also appear if Name is unchecked in options selector
      expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument(); // This will not have been visible if name had not been unchecked earlier.

      fireEvent.click(XPathExpression); //Uncheck XPath Expression column

      //Verifying that columns Name and Xpath expression are not visible.
      expect(entityTableHeaderRow.queryByText('Name')).not.toBeInTheDocument();
      expect(entityTableHeaderRow.queryByText('XPath Expression')).not.toBeInTheDocument();

      //Checking the columns one by one in selector and verify that they appear in entity table
      fireEvent.click(Name); //Check Name column
      //Props below should be available now
      expect(getByText('propId')).toBeInTheDocument(); 
      expect(getByText('propName')).toBeInTheDocument();

      fireEvent.click(XPathExpression); //Check XPathExpression column
      //Props below should be available now
      expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument();

    });

    test('Sorting in Source and Entity table',() => {

      const { getByTestId } = render(<SourceToEntityMap {...data.mapProps}
        mappingVisible={true}
        />);

      const sourceTableNameSort = getByTestId('sourceTableKey'); // For name column sorting
      const sourceTableValueSort = getByTestId('sourceTableValue'); // For value column sorting

      /* Validate sorting on Name column in source table */

      //Check the sort order of Name column rows before enforcing sort order
      let srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, 'proteinId', 'proteinType', 'nutFreeName', 'proteinCat', 'key');

      //Click on the Name column to sort the rows by Ascending order
      fireEvent.click(sourceTableNameSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, 'nutFreeName', 'proteinCat', 'proteinId', 'proteinType',  'key')

      //Click on the Name column to sort the rows by Descending order
      fireEvent.click(sourceTableNameSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, 'proteinType','proteinId', 'proteinCat', 'nutFreeName',  'key')

      //Click on the Name column again to remove the applied sort order and check if its removed
      fireEvent.click(sourceTableNameSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, 'proteinId', 'proteinType', 'nutFreeName', 'proteinCat', 'key')

      /* Validate sorting on Values column in source table */

      //Check the sort order of Values column rows before enforcing sort order
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, '123EAC', 'home', undefined, 'commercial', 'val');

      //Click on the Values column to sort the rows by Ascending order
      fireEvent.click(sourceTableValueSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, '123EAC', 'commercial', 'home', undefined, 'val')

      //Click on the Values column to sort the rows by Descending order
      fireEvent.click(sourceTableValueSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, 'home', 'commercial', '123EAC', undefined, 'val')

      //Click on the Value column again to remove the applied sort order and check if its removed
      fireEvent.click(sourceTableValueSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, '123EAC', 'home', undefined, 'commercial', 'val');

      /* Validate sorting in Entity table columns */
      const entityTableNameSort = getByTestId('entityTableName'); // For value column sorting
      const entityTableTypeSort = getByTestId('entityTableType'); // For Type column sorting

      //Check sort order of Name Column before clicking on sort button
      let entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, 'propId', 'propName', 'items', 'gender', 'name');

      //Click on the Name column to sort the rows by Ascending order
      fireEvent.click(entityTableNameSort);
      entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, 'gender', 'items', 'propId', 'propName', 'name')

      //Click on the Name column again to sort the rows by Descending order
      fireEvent.click(entityTableNameSort);
      entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, 'propName', 'propId', 'items', 'gender', 'name')

      fireEvent.click(entityTableNameSort); //Reset the sort order to go back to default order

      //Click on the Type column to sort the rows by Ascending order
      fireEvent.click(entityTableTypeSort);
      entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, 'int', 'ItemType [ ]', 'string', 'string', 'type');

      //Click on the Type column again to sort the rows by Descending order
      fireEvent.click(entityTableTypeSort);
      entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, 'string', 'string', 'ItemType [ ]', 'int', 'type');

      //Resetting the sort order to go back to default order
      fireEvent.click(entityTableTypeSort);
      entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, 'int', 'string', 'ItemType [ ]', 'string', 'type');
    });
});

describe('Enzyme Source-to-entity map tests', () => {
    let wrapper: any;
    beforeEach(() => {
        wrapper = shallow(<SourceToEntityMap {...data.mapProps} />);
    });

    test('Enzyme tests with source data', () => {
        //Use console.log(wrapper.debug()) for debugging the html returned by the wrapper;
        expect(wrapper.find('#srcContainer').length).toEqual(1);
        expect(wrapper.find('#srcDetails').length).toEqual(1);
        expect(wrapper.find('#entityContainer').length).toEqual(1);
        expect(wrapper.find('#noData').length).toEqual(0);
        expect(wrapper.find('#dataPresent').length).toEqual(1);
        //Success and Error message are shown only when a mapping expression is being saved
        expect(wrapper.find('#successMessage').length).toEqual(0);
        expect(wrapper.find('#errorMessage').length).toEqual(0);
        //List and Function icon are displayed only when the entity table loads with entity properties
        expect(wrapper.find('#listIcon').length).toEqual(0);
        expect(wrapper.find('#functionIcon').length).toEqual(0);
        expect(wrapper.find('#Clear-btn').length).toEqual(1);
        expect(wrapper.find('#Test-btn').length).toEqual(1);
        expect(wrapper.find('#errorInExp').length).toEqual(0);
        expect(wrapper.find('#valuesAfterTest').length).toEqual(0);
        const splitPane = wrapper.find(SplitPane);
        expect(splitPane).toHaveLength(1);
        expect(splitPane.prop('split')).toEqual('vertical');
        expect(splitPane.prop('primary')).toEqual('second');
        expect(splitPane.prop('allowResize')).toEqual(true);
        expect(wrapper.find(SplitPane).at(0).find('#srcContainer').length).toEqual(1);
        expect(wrapper.find(SplitPane).at(0).find('#entityContainer').length).toEqual(1)
    });

    test('Enzyme tests with no source data', () => {
        let noDataMessage = "Unable to find source documents using the specified collection or query." +
            "Load some data that mapping can use as reference and/or edit the step settings to use a " +
            "source collection or query that will return some results.";
        wrapper.setProps({sourceData: []} );
        expect(wrapper.find('#noData').length).toEqual(1);
        expect(wrapper.find('.emptyText').text().includes(noDataMessage)).toBeTruthy();
        expect(wrapper.find('#dataPresent').length).toEqual(0);
        const splitPane = wrapper.find(SplitPane);
        expect(splitPane).toHaveLength(1);
    });

  test('XML source data renders properly',() => {
    const { getByText } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true} sourceData={data.xmlSourceData}/>);
    expect(getByText('Source Data')).toBeInTheDocument();
    expect(getByText('proteinId')).toBeInTheDocument();
    expect(getByText('123EAC')).toBeInTheDocument();
    expect(getByText('@proteinType')).toBeInTheDocument();
    expect(getByText('home')).toBeInTheDocument();
    expect(getByText(/nutFree:/)).toBeInTheDocument();
    expect(getByText('FirstNamePreferred')).toBeInTheDocument();
  });

  test('Nested entity data renders properly',() => {
    
    const { getByText,getAllByText } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true}/>);
    expect(getByText('propId')).toBeInTheDocument();
    expect(getByText('propName')).toBeInTheDocument();
    expect(getByText('items')).toBeInTheDocument();
    expect(getByText('itemTypes')).toBeInTheDocument();
    expect(getByText('itemCategory')).toBeInTheDocument();
    expect(getAllByText('Context').length).toBe(2);
    expect(getByText('ItemType [ ]')).toBeInTheDocument();
    expect(getByText('artCraft')).toBeInTheDocument();
    expect(getByText('automobile')).toBeInTheDocument();
    //TO DO: Below tests can be done when working on E2E tests.
    //fireEvent.click(getByLabelText('icon: down'));
    //expect(queryByText('category')).not.toBeInTheDocument();
  })
});
