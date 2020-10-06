import React from 'react';
import { waitForElement, waitForElementToBeRemoved, render, cleanup, fireEvent, within } from '@testing-library/react';
import SourceToEntityMap from './source-to-entity-map';
import data from '../../../../assets/mock-data/curation/common.data';
import { shallow } from 'enzyme';
import SplitPane from 'react-split-pane';
import axiosMock from 'axios';
import { validateMappingTableRow, onClosestTableRow } from '../../../../util/test-utils';

jest.mock('axios');


describe('RTL Source-to-entity map tests', () => {
    afterEach(cleanup);

    beforeEach(() => jest.setTimeout(20000));

    test('RTL tests with no source data', () => {
        const { getByTestId,  getByText, getByRole } = render(<SourceToEntityMap {... {mapData: data.mapProps.mapData,entityTypeProperties:data.mapProps.entityTypeProperties, entityTypeTitle : data.mapProps.entityTypeTitle, sourceData: [], extractCollectionFromSrcQuery: jest.fn()}} mappingVisible={true}/>);
        expect(getByText('Source Data')).toBeInTheDocument();
        expect(getByText('Test')).toBeDisabled;
        expect(getByText('Clear')).toBeDisabled;
        expect(getByTestId("entityContainer")).toBeInTheDocument();
        expect(getByTestId("srcContainer")).toBeInTheDocument();
        expect(getByText("Unable to find source records using the specified collection or query.")).toBeInTheDocument;
        expect(getByTestId("srcContainer")).toHaveClass("sourceContainer");
        expect(getByText('Entity: Person')).toBeInTheDocument();
        expect(getByRole('presentation').className).toEqual("Resizer vertical ");
    });

    test('RTL tests with source data',  () => {
        const { getByTestId,  getByText, queryByText, rerender } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true}/>);
        expect(getByText('Source Data')).toBeInTheDocument();
        expect(getByText('proteinId')).toBeInTheDocument();
        expect(getByText('emptyString')).toBeInTheDocument();
        expect(getByText('nullValue')).toBeInTheDocument();
        expect(getByText('numberValue')).toBeInTheDocument();
        expect(getByText('booleanValue')).toBeInTheDocument();
        expect(getByText('whitespaceValue')).toBeInTheDocument();
        expect(getByText('emptyArrayValue')).toBeInTheDocument();
        expect(getByTestId("entityContainer")).toBeInTheDocument();
        expect(getByTestId("srcContainer")).toBeInTheDocument();
        expect(getByTestId("srcContainer")).toHaveClass("sourceContainer");
        expect(getByText('Entity: Person')).toBeInTheDocument();
        expect(getByText('Test')).toBeEnabled();

        // Check datatype class names for source values
        expect(getByTestId("emptyString-srcValue").children[0].className.includes('datatype-string')).toBe(true);
        expect(getByTestId("nullValue-srcValue").children[0].className.includes('datatype-null')).toBe(true);
        expect(getByTestId("numberValue-srcValue").children[0].className.includes('datatype-number')).toBe(true);
        expect(getByTestId("booleanValue-srcValue").children[0].className.includes('datatype-boolean')).toBe(true);
        expect(getByTestId("whitespaceValue-srcValue").children[0].className.includes('datatype-string')).toBe(true);
        expect(getByTestId("emptyArrayValue-srcValue").children[0].className.includes('datatype-object')).toBe(true);

        rerender(<SourceToEntityMap{...data.mapProps} mappingVisible={true} isLoading={true} />);
        expect(getByTestId('spinTest')).toBeInTheDocument();
        rerender(<SourceToEntityMap{...data.mapProps} mappingVisible={true} isLoading={false} />);
        expect(queryByText("Unable to find source records using the specified collection or query.")).not.toBeInTheDocument();
        let exp = getByText('testNameInExp');
        expect(exp).toBeInTheDocument();
        fireEvent.change(exp, { target: {value: "concat(name,'-NEW')" }});
        fireEvent.blur(exp);
        fireEvent.click(getByText('Clear'));
        expect(getByText('Clear')).toBeEnabled();
        expect(getByText("concat(name,'-NEW')")).toBeInTheDocument();
    });

    test('Filtering Name column in Source data table for array type data', () => {
        let arrayData = [ { rowKey: 1, key: 'email', val: 'test1@gmail.com' },
                          { rowKey: 2, key: 'email', val: 'test2@gmail.com' },
                          { rowKey: 3, key: 'email', val: 'test3@gmail.com' },
                          { rowKey: 4, key: 'forSearch', val: 'shouldBeFilteredOut' }
                        ];

        const { getAllByText, getByTestId, queryByText } = render(<SourceToEntityMap {...data.mapProps}
            mappingVisible={true}
            sourceData={arrayData}
            entityTypeProperties={data.entityTypePropertiesMultipleSiblings}
        />);

        fireEvent.click(getByTestId('filterIcon-key'));
        fireEvent.change(getByTestId('searchInput-key'), { target: { value: "email" } });
        fireEvent.click(getByTestId('submitSearch-key'));
        expect(getAllByText('email')).toHaveLength(3);
        expect(queryByText('forSearch')).not.toBeInTheDocument();
    });

    test('Mapping expression for a nested entity property with same name should be saved appropriately', async () => {
        const nestedEntityWithSameName = [
            { key: 1, name: 'propId', type: 'int' },
            { key: 2, name: 'propName', type: 'parent-Name', children: [
                { key: 3, name: 'propName/propName', type: 'parent-FirstName', children: [
                    { key: 4, name: 'propName/propName/propName', type: 'string' },
                    { key: 5, name: 'propPrefix', type: 'string' }
                ]},
                { key: 6, name: 'propMiddle', type: 'string' }
            ]},
            { key: 7, name: 'gender', type: 'string' }
          ];

        const { getByTestId, getAllByTestId } = render(<SourceToEntityMap {...data.mapProps}
            mappingVisible={true}
            entityTypeProperties={nestedEntityWithSameName}
        />);

        fireEvent.change(getAllByTestId('propName-mapexpression')[0], { target: { value: "concat(propName,'-NEW')" } });
        fireEvent.blur(getAllByTestId('propName-mapexpression')[0]);
        await(waitForElement(() => (getByTestId('successMessage'))));

        //Appropriate field should be saved when there are duplicate property names
        expect(getAllByTestId('propName-mapexpression')[0]).toHaveTextContent("concat(propName,'-NEW')");
        expect(getAllByTestId('propName-mapexpression')[1]).toHaveTextContent('');
    });

    test('Filtering Name column in Source (JSON Source Data) and Entity tables', () => {

        const { getByText, getByTestId, getAllByText, queryByText } = render(<SourceToEntityMap {...data.mapProps}
            mappingVisible={true}
            sourceData={data.jsonSourceDataMultipleSiblings}
            entityTypeProperties={data.entityTypePropertiesMultipleSiblings}
        />);

        //For Source table testing
        let sourcefilterIcon = getByTestId('filterIcon-key');
        let inputSearchSource = getByTestId('searchInput-key');
        let resetSourceSearch = getByTestId('ResetSearch-key');

        //For Entity table testing
        let entityfilterIcon = getByTestId('filterIcon-name');
        let inputSearchEntity = getByTestId('searchInput-name');
        let resetEntitySearch = getByTestId('ResetSearch-name');

        /* Test filter for JSON Source data in Source table  */
        fireEvent.click(sourcefilterIcon);

        fireEvent.change(inputSearchSource, { target: { value: "first" } }); //Enter a case-insensitive value in inputSearch field
        expect(inputSearchSource).toHaveValue('first');
        fireEvent.click(getByTestId('submitSearch-key')); //Click on Search button to apply the filter with the desired string

        //Check if the expected values are available/not available in search result.
        expect(getAllByText('nutFreeName').length).toEqual(2);
        expect(getAllByText('NamePreferred').length).toEqual(2);
        expect(getByText('John')).toBeInTheDocument();
        expect(queryByText('proteinId')).not.toBeInTheDocument();
        expect(queryByText('proteinType')).not.toBeInTheDocument();
        expect(queryByText('withNutsOrganism')).not.toBeInTheDocument();
        expect(queryByText('OrganismName')).not.toBeInTheDocument();
        expect(queryByText('Frog virus 3')).not.toBeInTheDocument();
        expect(queryByText('OrganismType')).not.toBeInTheDocument();
        expect(queryByText('scientific')).not.toBeInTheDocument();

        //Check if the entity properties are not affected by the filter on source table
        expect(getByText('propId')).toBeInTheDocument();
        expect(getByText('propName')).toBeInTheDocument();
        expect(queryByText('artCraft')).not.toBeInTheDocument();
        expect(queryByText('automobile')).not.toBeInTheDocument();
        expect(queryByText('speedometer')).not.toBeInTheDocument();
        expect(queryByText('windscreen')).not.toBeInTheDocument();

        //Reset the search filter on Source table
        fireEvent.click(sourcefilterIcon);
        fireEvent.click(resetSourceSearch);

        //Check if the table goes back to the default state after resetting the filter on source table.
        expect(getByText('proteinId')).toBeInTheDocument();
        expect(getByText('proteinType')).toBeInTheDocument();
        expect(getByText('withNutsOrganism')).toBeInTheDocument();
        expect(getByText('OrganismName')).toBeInTheDocument();
        expect(getByText('Frog virus 3')).toBeInTheDocument();
        expect(getByText('OrganismType')).toBeInTheDocument();
        expect(getByText('scientific')).toBeInTheDocument();
        expect(getAllByText('nutFreeName').length).toEqual(2);
        expect(getAllByText('FirstNamePreferred').length).toEqual(2);
        expect(getByText('John')).toBeInTheDocument();
        expect(queryByText('suffix')).not.toBeInTheDocument(); //This is not visible since only root and first level are expanded in the default state

        /* Test filter on Entity table  */

        //Updating expression for few fields to be validated later
        let exp = getByText('testNameInExp');
        fireEvent.change(exp, { target: { value: "concat(propName,'-NEW')" } });
        fireEvent.blur(exp);
        expect(getByText("concat(propName,'-NEW')")).toBeInTheDocument();

        //Moving along with the filter test
        fireEvent.click(entityfilterIcon);

        fireEvent.change(inputSearchEntity, { target: { value: "craft" } }); //Enter a case-insensitive value in inputEntitySearch field
        expect(inputSearchEntity).toHaveValue('craft');
        fireEvent.click(getByTestId('submitSearch-name')); //Click on Search button to apply the filter with the desired string

        //Check if the expected values are available/not available in search result.
        expect(getByText('items')).toBeInTheDocument();
        expect(getByText('itemTypes')).toBeInTheDocument();
        expect(getByText('itemCategory')).toBeInTheDocument();
        expect(getByText('Craft')).toBeInTheDocument();
        expect(queryByText('propId')).not.toBeInTheDocument();
        expect(queryByText('propName')).not.toBeInTheDocument();
        //productCategory should be visible and collapsed
        expect(getByText('productCategory')).toBeInTheDocument();
        expect(queryByText('speedometer')).not.toBeInTheDocument();
        expect(queryByText('windscreen')).not.toBeInTheDocument();

        //Check if the source table properties are not affected by the filter on Entity table
        expect(getByText('proteinId')).toBeInTheDocument();
        expect(getByText('proteinType')).toBeInTheDocument();
        expect(getAllByText('nutFreeName').length).toEqual(2);
        expect(getAllByText('FirstNamePreferred').length).toEqual(2);
        expect(getAllByText('LastName').length).toEqual(2);
        expect(getByText('withNutsOrganism')).toBeInTheDocument();
        expect(getByText('OrganismName')).toBeInTheDocument();
        expect(getByText('Frog virus 3')).toBeInTheDocument();
        expect(getByText('OrganismType')).toBeInTheDocument();
        expect(getByText('scientific')).toBeInTheDocument();
        expect(getByText('John')).toBeInTheDocument();
        expect(queryByText('suffix')).not.toBeInTheDocument();

        //Reset the search filter on Entity table
        fireEvent.click(entityfilterIcon);
        fireEvent.click(resetEntitySearch);

        //Check if the table goes back to the default state after resetting the filter on Entity table.
        expect(getByText('propId')).toBeInTheDocument();
        expect(getByText('propName')).toBeInTheDocument();
        expect(getByText('itemTypes')).toBeInTheDocument();
        expect(getByText('itemCategory')).toBeInTheDocument();
        expect(onClosestTableRow(getByText('artCraft'))?.style.display).toBe('none');
        expect(onClosestTableRow(getByText('automobile'))?.style.display).toBe('none');
        expect(getByText('productCategory')).toBeInTheDocument();
        expect(queryByText('speedometer')).not.toBeInTheDocument();
        expect(queryByText('windscreen')).not.toBeInTheDocument();
    });

    test('Filtering of Name column in XML Source data', () => {

        const { getByText, getByTestId, getAllByText, queryByText } = render(<SourceToEntityMap {...data.mapProps}
            mappingVisible={true}
            sourceData={data.xmlSourceDataMultipleSiblings}
            entityTypeProperties={data.entityTypePropertiesMultipleSiblings}
        />);

        /* Test filter on Source table with XML data  */
        let sourcefilterIcon = getByTestId('filterIcon-key');
        let inputSourceSearch = getByTestId('searchInput-key');
        let resetSourceSearch = getByTestId('ResetSearch-key');

        fireEvent.click(sourcefilterIcon); //Click on filter icon to open the search input field and other related buttons.

        fireEvent.change(inputSourceSearch, { target: { value: "organism" } }); //Enter a case-insensitive value in inputSearch field
        expect(inputSourceSearch).toHaveValue('organism');
        fireEvent.click(getByTestId('submitSearch-key')); //Click on Search button to apply the filter with the desired string

        //Check if the expected values are available/not available in search result.
        expect(getByText(/withNuts:/)).toBeInTheDocument();
        expect(getByText('Frog virus 3')).toBeInTheDocument();
        expect(getByText('scientific')).toBeInTheDocument();
        expect(getAllByText(/nutFree:/).length).toEqual(2);
        expect(queryByText('NamePreferred')).not.toBeInTheDocument();
        expect(queryByText('John')).not.toBeInTheDocument();
        expect(queryByText('LastName')).not.toBeInTheDocument();
        expect(queryByText('Smith')).not.toBeInTheDocument();

        //Check if the entity properties are not affected by the filter on source table
        expect(getByText('propId')).toBeInTheDocument();
        expect(getByText('propName')).toBeInTheDocument();
        expect(queryByText('artCraft')).not.toBeInTheDocument();
        expect(queryByText('automobile')).not.toBeInTheDocument();
        expect(queryByText('speedometer')).not.toBeInTheDocument();
        expect(queryByText('windscreen')).not.toBeInTheDocument();

        //Reset the search filter on Source table
        fireEvent.click(sourcefilterIcon);
        fireEvent.click(resetSourceSearch);

        //Check if the table goes back to the default state after resetting the filter on source table.
        expect(getAllByText(/nutFree:/).length).toEqual(2);
        expect(getByText(/withNuts:/)).toBeInTheDocument();
        expect(onClosestTableRow(getByText('Frog virus 3'))?.style.display).toBe('none');
        expect(onClosestTableRow(getByText('scientific'))?.style.display).toBe('none');
        expect(queryByText('NamePreferred')).not.toBeInTheDocument();
        expect(queryByText('LastName')).not.toBeInTheDocument();
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

      //Expanding all the nested levels first
      fireEvent.click(getByTestId('expandCollapseBtn-source'));
      fireEvent.click(getByTestId('expandCollapseBtn-entity'));

      const sourceTableNameSort = getByTestId('sourceTableKey'); // For name column sorting
      const sourceTableValueSort = getByTestId('sourceTableValue'); // For value column sorting

      /* Validate sorting on Name column in source table */

      //Check the sort order of Name column rows before enforcing sort order
      let srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, ['proteinId', 'proteinType', 'nutFreeName', 'proteinCat', 'proteinDog', 'emptyString', 'nullValue', 'numberValue', 'booleanValue', 'whitespaceValue', 'emptyArrayValue', 'numberArray', 'booleanArray'], 'key', data.mapProps.sourceData);

      //Click on the Name column to sort the rows by Ascending order
      fireEvent.click(sourceTableNameSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, ['booleanArray', 'booleanValue', 'emptyArrayValue', 'emptyString', 'nullValue', 'numberArray', 'numberValue', 'nutFreeName', 'proteinCat', 'proteinDog', 'proteinId', 'proteinType', 'whitespaceValue'],  'key', data.mapProps.sourceData);

      //Click on the Name column to sort the rows by Descending order
      fireEvent.click(sourceTableNameSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, ['whitespaceValue', 'proteinType','proteinId', 'proteinDog', 'proteinCat', 'nutFreeName', 'numberValue', 'numberArray', 'nullValue', 'emptyString', 'emptyArrayValue', 'booleanValue', 'booleanArray'],  'key', data.mapProps.sourceData);

      //Click on the Name column again to remove the applied sort order and check if its removed
      fireEvent.click(sourceTableNameSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, ['proteinId', 'proteinType', 'nutFreeName', 'proteinCat', 'proteinDog', 'emptyString', 'nullValue', 'numberValue', 'booleanValue', 'whitespaceValue', 'emptyArrayValue', 'numberArray', 'booleanArray'], 'key', data.mapProps.sourceData);

      /* Validate sorting on Values column in source table */

      //Check the sort order of Values column rows before enforcing sort order
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, ['123EAC', 'home', undefined, 'commercial', 'retriever, golden, labrador', '', 'null', '321', 'true', ' ', '[ ]', '1, 2, 3', 'true, false, true'], 'val', data.mapProps.sourceData);

      //Click on the Values column to sort the rows by Ascending order
      fireEvent.click(sourceTableValueSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, ['', ' ', '[ ]', '1, 2, 3', '123EAC', '321', 'commercial', 'home', 'null', 'retriever, golden, labrador', 'true', 'true, false, true', undefined], 'val', data.mapProps.sourceData);

      //Click on the Values column to sort the rows by Descending order
      fireEvent.click(sourceTableValueSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, ['true', 'retriever, golden, labrador', 'null', 'home', 'commercial', '123EAC', undefined, 'true, false, true', '321', '1, 2, 3', '[ ]', ' ', ''], 'val', data.mapProps.sourceData);

      //Click on the Value column again to remove the applied sort order and check if its removed
      fireEvent.click(sourceTableValueSort);
      srcTable = document.querySelectorAll('#srcContainer .ant-table-row-level-0');
      validateMappingTableRow(srcTable, ['123EAC', 'home', undefined, 'commercial', 'retriever, golden, labrador', '', 'null', '321', 'true', ' ', '[ ]', '1, 2, 3', 'true, false, true'], 'val', data.mapProps.sourceData);

      /* Validate sorting in Entity table columns */
      const entityTableNameSort = getByTestId('entityTableName'); // For value column sorting
      const entityTableTypeSort = getByTestId('entityTableType'); // For Type column sorting

      //Check sort order of Name Column before clicking on sort button
      let entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, ['propId', 'propName', 'propAttribute', 'items', 'gender'], 'name', data.mapProps.entityTypeProperties);

      //Click on the Name column to sort the rows by Ascending order
      fireEvent.click(entityTableNameSort);
      entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, ['gender', 'items', 'propAttribute', 'propId', 'propName'], 'name', data.mapProps.entityTypeProperties);

      //Click on the Name column again to sort the rows by Descending order
      fireEvent.click(entityTableNameSort);
      entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, ['propName', 'propId', 'propAttribute', 'items', 'gender'], 'name', data.mapProps.entityTypeProperties);

      fireEvent.click(entityTableNameSort); //Reset the sort order to go back to default order

      //Click on the Type column to sort the rows by Ascending order
      fireEvent.click(entityTableTypeSort);
      entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, ['int', 'ItemType [ ]', 'string', 'string', 'string'], 'type', data.mapProps.entityTypeProperties);

      //Click on the Type column again to sort the rows by Descending order
      fireEvent.click(entityTableTypeSort);
      entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, ['string', 'string', 'string', 'ItemType [ ]', 'int'], 'type', data.mapProps.entityTypeProperties);

      //Resetting the sort order to go back to default order
      fireEvent.click(entityTableTypeSort);
      entTable = document.querySelectorAll('#entityContainer .ant-table-row-level-0');
      validateMappingTableRow(entTable, ['int', 'string', 'string', 'ItemType [ ]', 'string'], 'type', data.mapProps.entityTypeProperties);
    });

    test('Verify evaluation of valid expression for mapping writer user', async () => {
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: data.testJSONResponse })));
        const { getByText, getByTestId, queryByTestId } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true} />);
        let propNameExpression = getByText('testNameInExp');
        let propAttributeExpression = getByText('placeholderAttribute');

        fireEvent.change(propNameExpression, { target: {value: "proteinID" }});
        fireEvent.blur(propNameExpression);
        fireEvent.change(propAttributeExpression, { target: {value: "proteinType" }});
        fireEvent.blur(propAttributeExpression);

        // Test button should be disabled before mapping expression is saved
        expect(document.querySelector('#Test-btn')).toBeDisabled();

        // waiting for success message before clicking on Test button
        await(waitForElement(() => (getByTestId('successMessage'))));
        // checking successMessage is still there before waitForElementToBeRemoved as this would occasionally fail under load
        if (queryByTestId('successMessage')) {
            await (waitForElementToBeRemoved(() => (queryByTestId('successMessage'))));
        }

        // Test button should be enabled after mapping expression is saved
        expect(document.querySelector('#Test-btn')).toBeEnabled();

        //Verify Test button click
        fireEvent.click(getByText('Test'));
        await(waitForElement(() => getByTestId('propName-value')));
        expect(getByTestId('propName-value')).toHaveTextContent('123EAC');
        expect(getByTestId('propAttribute-value')).toHaveTextContent('home');

        //Verify Clear button click
        fireEvent.click(getByText('Clear'));
        expect(getByTestId('propName-value')).not.toHaveTextContent('123EAC');
        expect(getByTestId('propAttribute-value')).not.toHaveTextContent('home');
        // DEBUG
        // debug(onClosestTableRow(getByTestId('propName-value')))
        // debug(onClosestTableRow(getByTestId('propAttribute-value')))
    });

    test('Truncation in case of responses for Array datatype', async () => {
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: data.truncatedJSONResponse })));
        const { getByText, getByTestId, queryByTestId } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true} entityTypeProperties={data.truncatedEntityProps} sourceData = {data.JSONSourceDataToTruncate}/>);
        let propNameExpression = getByText('testNameInExp');
        let propAttributeExpression = getByText('placeholderAttribute');

        fireEvent.change(propNameExpression, { target: {value: "proteinID" }});
        fireEvent.blur(propNameExpression);
        fireEvent.change(propAttributeExpression, { target: {value: "proteinType" }});
        fireEvent.blur(propAttributeExpression);

        // Test button should be disabled before mapping expression is saved
        expect(document.querySelector('#Test-btn')).toBeDisabled();

        // waiting for success message before clicking on Test button
        await(waitForElement(() => (getByTestId('successMessage'))));
        if (queryByTestId('successMessage')) {
            await (waitForElementToBeRemoved(() => (queryByTestId('successMessage'))));
        }

        //Verify truncated text in Source table
        await(waitForElement(() => getByTestId('proteinId-srcValue')));
        expect(getByTestId('proteinId-srcValue')).toHaveTextContent('extremelylongu...');
        expect(getByTestId('proteinType-srcValue')).toHaveTextContent('s@ml.com (7 more)');

        //Verify tooltip shows full value when hovering Source values
        fireEvent.mouseOver(getByText('extremelylongu...'));
        await waitForElement(() => getByText('extremelylongusername@marklogic.com'));

        //Verify tooltip shows all values in a list when hovering values with multiple items
        fireEvent.mouseOver(getByText((_, node) => node.textContent == '(7 more)'));
        await waitForElement(() => getByText('s@ml.com, , t@ml.com, u@ml.com, v@ml.com, w@ml.com, x@ml.com, y@ml.com, z@ml.com'));

        // Test button should be enabled after mapping expression is saved
        expect(document.querySelector('#Test-btn')).toBeEnabled();

        //Verify Test button click and truncated text in Entity table
        fireEvent.click(getByText('Test'));
        await(waitForElement(() => getByTestId('propName-value')));
        expect(getByTestId('propName-value')).toHaveTextContent('extremelylongusername@m...');
        expect(getByTestId('propAttribute-value')).toHaveTextContent('s@ml.com (7 more)');

        // Verify tooltip shows full value when hovering Test values
        fireEvent.mouseOver(getByText('extremelylongusername@m...'));
        await waitForElement(() => getByText('extremelylongusername@marklogic.com'));
    });

    test('Verify evaluation of valid expression for mapping reader user', async () => {
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: data.testJSONResponse })));
        //Updating mapping expression as a mapping writer user first
        const { getByText, getByTestId, rerender } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true} />);
        let propAttributeExpression = getByText('placeholderAttribute');

        fireEvent.change(propAttributeExpression, { target: {value: "proteinType" }});
        fireEvent.blur(propAttributeExpression);

        // waiting for success message before clicking on Test button
        await(waitForElement(() => (getByTestId('successMessage'))));

        //Rerendering as a mapping reader user
        rerender(<SourceToEntityMap {...data.mapProps} canReadWrite={false} canReadOnly={true} mappingVisible={true}/>);

        //Verify Test button click
        fireEvent.click(getByText('Test'));
        await(waitForElement(() => getByTestId('propAttribute-value')));
        expect(getByTestId('propAttribute-value')).toHaveTextContent('home');

        //Verify Clear button click
        fireEvent.click(getByText('Clear'));
        expect(getByTestId('propAttribute-value')).not.toHaveTextContent('home');

        //Verify that fx/source-data list is disabled for mapping reader user
        expect(getByTestId('propId-1-functionIcon')).toBeDisabled();
        expect(getByTestId('propId-listIcon1')).toHaveAttribute('disabled');
    });

    test('Verify evaluation of invalid expression for mapping writer user', async () => {
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: data.errorJSONResponse })));
        const { getByText, getByTestId, queryByTestId } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true} />);
        let propIdExpression = getByText('id');

        fireEvent.change(propIdExpression, { target: {value: "proteinID" }});
        fireEvent.blur(propIdExpression);

        // waiting for success message before clicking on Test button
        await(waitForElement(() => (getByTestId('successMessage'))));

        //Verify Test button click
        fireEvent.click(getByText('Test'));
        await(waitForElement(() => getByTestId('propId-expErr')));

        //debug(onClosestTableRow(getByTestId('propId-value')))
        expect(getByTestId('propId-expErr')).toHaveTextContent(data.errorJSONResponse.properties.propId.errorMessage);
        expect(getByTestId('propId-value')).toHaveTextContent('');

        //SCROLL TEST FOR BUG DHFPROD-4743
        //let element = document.querySelector('#entityContainer .ant-table-body')
        //getByText('propId').closest('div');
        //expect(document.querySelector('#entityContainer .ant-table-fixed-header')).not.toHaveClass('ant-table-scroll-position-right')
        //fireEvent.scroll(element).valueOf()
        //expect(document.querySelector('#entityContainer .ant-table-fixed-header')).not.toHaveClass('ant-table-scroll-position-right')
        //debug(document.querySelector('#entityContainer .ant-table-fixed-header'))

        //Verify Clear button click
        fireEvent.click(getByText('Clear'));
        expect(queryByTestId('propId-expErr')).toBeNull();

        //Verify that fx/source-data list is enabled for mapping writer user
        expect(getByTestId('propId-1-functionIcon')).toBeEnabled();
        expect(getByTestId('propId-listIcon1')).not.toHaveAttribute('disabled');
    });

    test('Verify evaluation of invalid expression for mapping reader user', async () => {
        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: data.errorJSONResponse })));
        //Updating mapping expression as a mapping writer user first
        const { getByText, getByTestId, rerender, queryByTestId } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true} />);
        let propIdExpression = getByText('id');

        fireEvent.change(propIdExpression, { target: {value: "proteinID" }});
        fireEvent.blur(propIdExpression);

        // waiting for success message before clicking on Test button
        await(waitForElement(() => (getByTestId('successMessage'))));

        //Rerendering as a mapping reader user
        rerender(<SourceToEntityMap {...data.mapProps} canReadWrite={false} canReadOnly={true} mappingVisible={true} />);

        //Verify Test button click
        fireEvent.click(getByText('Test'));
        await(waitForElement(() => getByTestId('propId-expErr')));

        //debug(onClosestTableRow(getByTestId('propId-value')))
        expect(getByTestId('propId-expErr')).toHaveTextContent(data.errorJSONResponse.properties.propId.errorMessage);
        expect(getByTestId('propId-value')).toHaveTextContent('');

        //Verify Clear button click
        fireEvent.click(getByText('Clear'));
        expect(queryByTestId('propId-expErr')).toBeNull();
    });

    xtest('Verify evaluation of valid expression for XML source document', () => {
        // const { getByText } = render(<SourceToEntityMap {...data.mapProps} sourceData={data.xmlSourceData} mappingVisible={true} />);
        /**
         * TODO once DHFPROD-4845 is implemented
         */

    });

    test('CollapseAll/Expand All feature in JSON Source data table and Entity table', () => {

        const { getByTestId, getByText, queryByText, rerender, getByLabelText } = render(<SourceToEntityMap {...data.mapProps}
            mappingVisible={true}
        />);

        /* Validate collapse-expand in source table */
        //Check if the expected source table elements are present in the DOM before hittting the Expan/Collapse button
        expect(queryByText('suffix')).not.toBeInTheDocument();
        expect(getByText('nutFreeName')).toBeInTheDocument();
        expect(getByText('FirstNamePreferred')).toBeInTheDocument();
        expect(getByText('LastName')).toBeInTheDocument();

        let expandCollapseBtnSrc = getByTestId('expandCollapseBtn-source');

        expect(expandCollapseBtnSrc.textContent).toBe('Expand All'); // Validating the button label

        fireEvent.click(expandCollapseBtnSrc); //Expanding all nested levels
        expect(expandCollapseBtnSrc.textContent).toBe('Collapse All'); // Validating the button label
        expect(getByText('suffix')).toBeInTheDocument();

        //Check if indentation is right
        expect(getByText('suffix').closest('td')?.firstElementChild).toHaveStyle("padding-left: 40px;");

        fireEvent.click(expandCollapseBtnSrc); //Collapsing all child levels
        expect(expandCollapseBtnSrc.textContent).toBe('Expand All'); // Validating the button label
        expect(onClosestTableRow(getByText('suffix'))?.style.display).toBe('none'); // Checking if the row is marked hidden in DOM. All collapsed rows are marked hidden(display: none) once you click on Collapse All button.
        expect(onClosestTableRow(getByText('FirstNamePreferred'))?.style.display).toBe('none');
        expect(onClosestTableRow(getByText('LastName'))?.style.display).toBe('none');

        /* Validate collapse-expand in Entity table */
        //Check if the expected Entity table elements are present in the DOM before hittting the Expand/Collapse button
        expect(queryByText('artCraft')).not.toBeInTheDocument();
        expect(getByText('items')).toBeInTheDocument();
        expect(getByText('itemTypes')).toBeInTheDocument();
        expect(getByText('itemCategory')).toBeInTheDocument();

        let expandCollapseBtn = getByTestId('expandCollapseBtn-entity');

        expect(expandCollapseBtn.textContent).toBe('Expand All');

        fireEvent.click(expandCollapseBtn); //Expanding all nested levels
        expect(expandCollapseBtn.textContent).toBe('Collapse All');
        expect(getByText('artCraft')).toBeInTheDocument();

        //Check if indentation is right
        expect(getByText('artCraft').closest('td')?.firstElementChild).toHaveStyle("padding-left: 28px;");

        fireEvent.click(expandCollapseBtn); //Collapsing all child levels
        expect(expandCollapseBtn.textContent).toBe('Expand All');
        expect(onClosestTableRow(getByText('artCraft'))?.style.display).toBe('none'); // Checking if the row is marked hidden(collapsed) in DOM. All collapsed rows are marked hidden(display: none) once you click on Collapse All button.
        expect(onClosestTableRow(getByText('itemTypes'))?.style.display).toBe('none');
        expect(onClosestTableRow(getByText('itemCategory'))?.style.display).toBe('none');

        //Verify Expand/Collapse button for source and entity tables resets to 'Expand All' when Modal is closed and reoponed
        fireEvent.click(expandCollapseBtn);
        expect(expandCollapseBtn.textContent).toBe('Collapse All');
        fireEvent.click(expandCollapseBtnSrc);
        expect(expandCollapseBtnSrc.textContent).toBe('Collapse All');
        fireEvent.click(getByLabelText('Close'));
        rerender(<SourceToEntityMap {...data.mapProps}
            mappingVisible={true}
        />);
        expect(expandCollapseBtn.textContent).toBe('Expand All');
        expect(expandCollapseBtnSrc.textContent).toBe('Expand All');

    });

    test('CollapseAll/Expand All feature in XML Source data table', () => {

        const { getByTestId, getByText, getAllByText, queryByText } = render(<SourceToEntityMap {...data.mapProps}
            mappingVisible={true}
            sourceData={data.xmlSourceData}
        />);

        //Check if the expected elements are present in the DOM before hittting the Expand/Collapse button
        expect(queryByText('FirstNamePreferred')).not.toBeInTheDocument();
        expect(queryByText('LastName')).not.toBeInTheDocument();
        let nutFree = getAllByText(/nutFree/);
        expect(nutFree.length).toEqual(2);
        expect(getByText('@proteinType')).toBeInTheDocument();
        expect(getByText('proteinId')).toBeInTheDocument();

        let expandCollapseBtn = getByTestId('expandCollapseBtn-source');

        expect(expandCollapseBtn.textContent).toBe('Expand All');

        fireEvent.click(expandCollapseBtn); //Expanding all nested levels
        expect(expandCollapseBtn.textContent).toBe('Collapse All');
        let firstName = getByText('FirstNamePreferred');
        let lastName = getByText('LastName');
        let proteinId = getByText('proteinId');
        expect(firstName).toBeInTheDocument();
        expect(firstName.closest('td')?.firstElementChild).toHaveStyle("padding-left: 40px;"); // Check if the indentation is right

        expect(lastName).toBeInTheDocument();
        expect(lastName.closest('td')?.firstElementChild).toHaveStyle("padding-left: 40px;"); // Check if the indentation is right

        fireEvent.click(expandCollapseBtn); //Collapsing back to the default view (root and 1st level)
        expect(expandCollapseBtn.textContent).toBe('Expand All');
        expect(expandCollapseBtn.textContent).toBe('Expand All');
        expect(onClosestTableRow(proteinId)?.style.display).toBe('none');
        expect(onClosestTableRow(firstName)?.style.display).toBe('none');
        expect(onClosestTableRow(lastName)?.style.display).toBe('none');
    });

    test('Function selector dropdown in entity table', async () => {

        axiosMock.post['mockImplementation'](jest.fn(() => Promise.resolve({ status: 200, data: data.testJSONResponseWithFunctions })));
        const { getByText, getByTestId, getAllByRole, queryByText, queryByTestId } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true} />);

        //Prepare the map expression field for function signature later
        let propAttributeExpression = getByTestId('propAttribute-mapexpression');
        fireEvent.change(propAttributeExpression, { target: { value: "" } });
        fireEvent.blur(propAttributeExpression);

        let functionSelector = getByTestId("propAttribute-3-functionIcon");
        fireEvent.click(functionSelector);
        let inputBox = getByText(
            (_content, element) =>
                element.className != null &&
                element.className === "ant-select-search__field"
        );

        await (waitForElement(() => getAllByRole("option"), { "timeout": 200 }));
        expect(getByText('concat')).toBeInTheDocument();
        expect(getByText('documentLookup')).toBeInTheDocument();

        fireEvent.click(inputBox); // focus on the search box

        // Filter out the funcitons list to get to concat function
        fireEvent.change(inputBox, { target: { value: "conc" } });
        expect(getByText('concat')).toBeInTheDocument();
        expect(queryByText('documentLookup')).not.toBeInTheDocument();

        //Choose the concat function
        fireEvent.keyDown(inputBox, { key: 'Enter', code: 'Enter', keyCode: 13, charCode: 13 });

        //Map Expression is populated with function signature
        expect(propAttributeExpression).toHaveTextContent("concat(xs:anyAtomicType?)");
        fireEvent.change(propAttributeExpression, { target: { value: "concat(proteinType,'-NEW')" } });
        fireEvent.blur(propAttributeExpression);

        await (waitForElement(() => (getByTestId('successMessage'))));
        if (queryByTestId('successMessage')) {
            await (waitForElementToBeRemoved(() => (queryByTestId('successMessage'))));
        }

        expect(propAttributeExpression).toHaveTextContent("concat(proteinType,'-NEW')");

        //Click again on the same function button to verify if it opens up again with the list of functions
        fireEvent.click(functionSelector);
        await (waitForElement(() => getAllByRole("option"), { "timeout": 200 }));
        fireEvent.click(inputBox);

        //Verify multiple matches
        fireEvent.change(inputBox, { target: { value: "Lookup" } });
        expect(getByText('memoryLookup')).toBeInTheDocument();
        expect(getByText('documentLookup')).toBeInTheDocument();
        expect(queryByText('parseDateTime')).not.toBeInTheDocument();

        //Click on the Fx button again to close the list
        fireEvent.click(functionSelector);

        //Verify if value appears in the Value column after clicking on Test button
        fireEvent.click(getByText('Test'));
        await (waitForElement(() => getByTestId('propAttribute-value')));
        expect(getByTestId('propAttribute-value')).toHaveTextContent('home-NEW'); // home should be mapped as home-New

    });

    test('URI nav index resets on close of mapping',  async() => {
        const { getByLabelText, getByTestId } = render(<SourceToEntityMap {...data.mapProps}  mappingVisible={true}/>);

        // URI index starts at 1
        let uriIndex = within(getByLabelText('uriIndex'));
        expect(uriIndex.getByText('1')).toBeInTheDocument();

        // Click next, URI index is 2
        fireEvent.click(getByTestId('navigate-uris-right'));
        uriIndex = within(getByLabelText('uriIndex'));
        expect(uriIndex.getByText('2')).toBeInTheDocument();

        // Close mapping modal
        fireEvent.click(getByLabelText('icon: close'));

        // URI index reset to 1
        uriIndex = within(getByLabelText('uriIndex'));
        expect(uriIndex.getByText('1')).toBeInTheDocument();
    });

});

describe('Enzyme Source-to-entity map tests', () => {
    let wrapper: any;
    beforeEach(() => {
        wrapper = shallow(<SourceToEntityMap {...data.mapProps} />);
    });
    afterEach(cleanup);

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
        expect(wrapper.find(SplitPane).at(0).find('#entityContainer').length).toEqual(1);
    });

    test('Enzyme tests with no source data', () => {
        let noDataMessage = "Unable to find source records using the specified collection or query." +
            "Load some data that mapping can use as reference and/or edit the step settings to use a " +
            "source collection or query that will return some results.";
        wrapper.setProps({sourceData: []} );
        expect(wrapper.find('#noData').length).toEqual(1);
        expect(wrapper.find('.emptyText').text().includes(noDataMessage)).toBeTruthy();
        expect(wrapper.find('#dataPresent').length).toEqual(0);
        const splitPane = wrapper.find(SplitPane);
        expect(splitPane).toHaveLength(1);
    });

    test('XML source data renders properly',async () => {
        const { getByText, getAllByText, getByTestId } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true} sourceData={data.xmlSourceData}/>);
        //Expanding all the nested levels first
        fireEvent.click(getByTestId('expandCollapseBtn-source'));
        fireEvent.click(getByTestId('expandCollapseBtn-entity'));

        expect(getByText('Source Data')).toBeInTheDocument();
        expect(getByText('proteinId')).toBeInTheDocument();
        expect(getByText('123EAC')).toBeInTheDocument();
        expect(getByText('@proteinType')).toBeInTheDocument();
        expect(getByText('home')).toBeInTheDocument();
        expect(getAllByText(/nutFree:/)).toHaveLength(2);
        expect(getByText('FirstNamePreferred')).toBeInTheDocument();
        expect(getByTestId('nutFree:proteinDog-srcValue')).toHaveTextContent('retriever (2 more)');
        fireEvent.mouseOver(getByText('(2 more)'));
        await waitForElement(() => getByText('retriever, , golden, labrador'));
    });

    test('Nested entity data renders properly',() => {

        const { getByText,getAllByText,getByTestId } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true}/>);

        //Expanding all the nested levels first
        fireEvent.click(getByTestId('expandCollapseBtn-source'));
        fireEvent.click(getByTestId('expandCollapseBtn-entity'));

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
    });
});

describe('RTL Source Selector/Source Search tests', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });
    beforeEach(() => jest.setTimeout(20000));

    test('Search source',  async() => {
        axiosMock.post['mockImplementation'](data.mapProps.updateMappingArtifact);

        const {getByText,getAllByText, getByTestId, getAllByRole} = render(<SourceToEntityMap {...data.mapProps}  mappingVisible={true}/>);

        let sourceSelector = getByTestId("itemTypes-listIcon");

        //corresponds to 'itemTypes' source selector
        fireEvent.click(sourceSelector);

        await(waitForElement(() =>  getAllByRole("option"),{"timeout":200}));
        let firstName = getAllByText("FirstNamePreferred");
        expect(firstName.length).toEqual(2);

        let lastName = getAllByText("LastName");
        expect(lastName.length).toEqual(2);

        let inputBox = getByText(
            (_content, element) =>
                element.className != null &&
                element.className ==="ant-select-search__field"
        );

        fireEvent.click(inputBox);
        fireEvent.change(inputBox, { target: {value: "Fir" }});

        //2 instances of 'firstName'
        firstName = getAllByText("FirstNamePreferred");
        expect(firstName.length).toEqual(2);

        //Only 1 instances of 'lastName' as search has narrowed the results
        lastName = getAllByText("LastName");
        expect(lastName.length).toEqual(1);

        fireEvent.keyDown(inputBox, { key: 'Enter', code: 'Enter' , keyCode: 13, charCode: 13 });

        //mapping is saved
        expect(await(waitForElement(() => getByTestId("successMessage"),{"timeout":200})));

        let mapExp = getByTestId("itemTypes-mapexpression");
        //Right Xpath is populated
        expect(mapExp).toHaveTextContent("nutFreeName/FirstNamePreferred");
    });

    test('JSON source data with objects - Right display of objects and icons in source dropdown', async() => {
        axiosMock.post['mockImplementation'](data.mapProps.updateMappingArtifact);
        const { getByText, getByTestId, getAllByTestId } = render(<SourceToEntityMap {...data.mapProps} sourceData = {data.jsonSourceDataMultipleSiblings} mappingVisible={true}/>);
        let sourceSelector = getByTestId("itemTypes-listIcon");
        fireEvent.click(sourceSelector);

        //Verify object properties in source dropdown only appear once when data is an array of Objects
        expect(getAllByTestId('nutFreeName-option').length).toEqual(1);
        expect(getAllByTestId('FirstNamePreferred-option').length).toEqual(1);
        expect(getAllByTestId('LastName-option').length).toEqual(1);

        //Verify Array icon is not present when item has no children
        expect(getByTestId('FirstNamePreferred-optionIcon')).toHaveAttribute('src', '');

        //Verify Array icon is present when item has children
        expect(getByTestId('nutFreeName-optionIcon')).toHaveAttribute('src', 'icon_array.png');
        expect(getByTestId('LastName-optionIcon')).toHaveAttribute('src', 'icon_array.png');

        //Verify tooltip for Array icon
        fireEvent.mouseOver(getByTestId('LastName-optionIcon'));
        await waitForElement(() => getByText('Multiple'));
        fireEvent.mouseOver(getByTestId('nutFreeName-optionIcon'));
        await waitForElement(() => getByText('Multiple'));

    });

    test('XML source data with objects - Right display of objects and icons in source dropdown', async() => {
        axiosMock.post['mockImplementation'](data.mapProps.updateMappingArtifact);
        const { getByText, getByTestId, getAllByTestId } = render(<SourceToEntityMap {...data.mapProps} sourceData = {data.xmlSourceDataMultipleSiblings} mappingVisible={true}/>);
        let sourceSelector = getByTestId("itemTypes-listIcon");
        fireEvent.click(sourceSelector);

        //Verify object properties in source dropdown only appear once when data is an array of Objects
        expect(getAllByTestId('nutFree:name-option').length).toEqual(1);
        expect(getAllByTestId('FirstNamePreferred-option').length).toEqual(1);
        expect(getAllByTestId('LastName-option').length).toEqual(1);

        //Verify Array icon is not present when item has no children
        expect(getByTestId('FirstNamePreferred-optionIcon')).toHaveAttribute('src', '');

        //Verify Array icon is present when item has children
        expect(getByTestId('nutFree:name-optionIcon')).toHaveAttribute('src', 'icon_array.png');

        //Verify tooltip for Array icon
        fireEvent.mouseOver(getByTestId('nutFree:name-optionIcon'));
        await waitForElement(() => getByText('Multiple'));
    });


    test('Nested JSON source data - Right XPATH expression',  async() => {
        axiosMock.post['mockImplementation'](data.mapProps.updateMappingArtifact);
        const { getByText, getAllByText, getByTestId, getAllByRole } = render(<SourceToEntityMap {...data.mapProps}  mappingVisible={true}/>);
        expect(getByText('Source Data')).toBeInTheDocument();
        expect(getByText('Entity: Person')).toBeInTheDocument();
        expect(getByText('Test')).toBeEnabled();

        let sourceSelector = getByTestId("itemTypes-listIcon");

        //corresponds to 'itemTypes' source selector
        fireEvent.click(sourceSelector);

        await(waitForElement(() =>  getAllByRole("option"),{"timeout":200}));
        let firstName = getAllByText("FirstNamePreferred");
        expect(firstName.length).toEqual(2);

        //Check if indentation is right
        expect(firstName[1]).toHaveStyle("line-height: 2vh; text-indent: 20px;");

        //Verify Array icon is present when item has no children but value was an Array of simple values.
        expect(getByTestId('proteinDog-optionIcon')).toHaveAttribute('src', 'icon_array.png');

        //Verify tooltip for Array icon
        fireEvent.mouseOver(getByTestId('proteinDog-optionIcon'));
        await waitForElement(() => getByText('Multiple'));

        //Click on 'FirstNamePreferred'
        fireEvent.click(firstName[1]);

        //mapping is saved
        expect(await(waitForElement(() => getByTestId("successMessage"),{"timeout":200})));

        let mapExp = getByTestId("itemTypes-mapexpression");
        //Right Xpath is populated
        expect(mapExp).toHaveTextContent("nutFreeName/FirstNamePreferred");

    });

    test('Nested XML source data - Right XPATH expression',  async() => {
        axiosMock.post['mockImplementation'](data.mapProps.updateMappingArtifact);
        const {getAllByText,getByTestId, getAllByTestId, getByText, getAllByRole} = render(<SourceToEntityMap {...data.mapProps}  sourceData={data.xmlSourceData} mappingVisible={true}/>);

        //Expanding all the nested levels first
        fireEvent.click(getByTestId('expandCollapseBtn-source'));
        fireEvent.click(getByTestId('expandCollapseBtn-entity'));
        let sourceSelector = getByTestId("itemTypes-listIcon");

        //corresponds to 'itemTypes' source selector
        fireEvent.click(sourceSelector);

        await(waitForElement(() =>  getAllByRole("option"),{"timeout":200}));
        let lastName = getAllByText("LastName");
        expect(lastName.length).toEqual(2);

        //Check if indentation is right
        expect(lastName[1]).toHaveStyle("line-height: 2vh; text-indent: 40px;");

        //Verify Array icon is not present when item has no children
        expect(getByTestId('FirstNamePreferred-optionIcon')).toHaveAttribute('src', '');

        //Verify Array icon is present when item has children
        expect(getByTestId('sampleProtein-optionIcon')).toHaveAttribute('src', 'icon_array.png');

        //Verify Array icon is present when item has no children but value was an Array of simple values.
        expect(getByTestId('nutFree:proteinDog-optionIcon')).toHaveAttribute('src', 'icon_array.png');

        //Verify option in source dropdown only appears once when value is an Array of simple values.
        let proteinDog = (getAllByTestId('nutFree:proteinDog-option'));
        expect(proteinDog.length).toEqual(1);

        //Verify option representing object in source dropdown only appears once when value is an array of Objects.
        let nutFreeName = (getAllByTestId('nutFree:name-option'));
        expect(nutFreeName.length).toEqual(1);

        //Verify tooltip for Array icon
        fireEvent.mouseOver(getByTestId('LastName-optionIcon'));
        await waitForElement(() => getByText('Multiple'));

        //Click on 'FirstNamePreferred'
        fireEvent.click(lastName[1]);

        //mapping is saved
        expect(await(waitForElement(() => getByTestId("successMessage"),{"timeout":200})));

        let mapExp = getByTestId("itemTypes-mapexpression");
        //Right Xpath is populated
        expect(mapExp).toHaveTextContent("sampleProtein/nutFree:name/LastName");

        //Right Xpath population for namespaced option representing array of values
        sourceSelector = getByTestId("items-listIcon");
        fireEvent.click(sourceSelector);
        await(waitForElement(() =>  getAllByRole("option"),{"timeout":200}));
        let proteinDogOption = (getAllByTestId('nutFree:proteinDog-option'));
        expect(proteinDogOption.length).toEqual(2);
        fireEvent.click(proteinDogOption[1]);
        mapExp = getByTestId("items-mapexpression");
        expect(mapExp).toHaveTextContent("sampleProtein/nutFree:proteinDog");

    });

    test('Right XPATH with source context',  async() => {
        axiosMock.post['mockImplementation'](data.mapProps.updateMappingArtifact);
        const {getAllByText, getAllByRole,getByTestId,queryByTestId } = render(<SourceToEntityMap {...data.mapProps}  mappingVisible={true}/>);

        let sourceSelector = getByTestId("items-listIcon");

        //corresponds to 'items' source selector
        fireEvent.click(sourceSelector);

        await(waitForElement(() =>  getAllByRole("option"),{"timeout":600}));
        //Set 'sourceContext' to 'nutFreeName'
        let nutFreeName = getAllByText("nutFreeName");
        expect(nutFreeName.length).toEqual(2);
        fireEvent.click(getAllByText("nutFreeName")[1]);
        expect(await(waitForElement(() => getByTestId("successMessage"),{"timeout":600})));

        let mapExp = getByTestId("items-mapexpression");
        //Right Xpath is populated
        expect(mapExp).toHaveTextContent("nutFreeName");

        sourceSelector = getByTestId("itemTypes-listIcon");
        fireEvent.click(sourceSelector);
        await(waitForElement(() => getAllByRole("option"),{"timeout":600}));
        let firstName = getAllByText("FirstNamePreferred");
        fireEvent.click(firstName[2]);
        //mapping is saved
        await (waitForElement(() => getByTestId("successMessage")));
        if (queryByTestId('successMessage')) {
            await (waitForElementToBeRemoved(() => (queryByTestId('successMessage'))));
        }

        mapExp = getByTestId("itemTypes-mapexpression");

        //Right Xpath is populated (and not nutFreeName/FirstNamePreferred since sourceContext is set)
        expect(mapExp).toHaveTextContent("FirstNamePreferred");
    });
});

