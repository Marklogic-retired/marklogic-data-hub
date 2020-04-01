import React from 'react';
import { render, cleanup, fireEvent, getByTestId } from '@testing-library/react';
import SourceToEntityMap from './source-to-entity-map';
import data from '../../../../config/data.config';
import { shallow } from 'enzyme';
import SplitPane from 'react-split-pane';

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
        let exp = getByText('mappedName');
        expect(exp).toBeInTheDocument();
        fireEvent.change(exp, { target: {value: "concat(name,'-NEW')" }});
        fireEvent.blur(exp);
        fireEvent.click(getByText('Clear'));
        expect(getByText('Clear')).toBeEnabled();
        expect(getByText("concat(name,'-NEW')")).toBeInTheDocument();
        console.log(container);
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
    const { getByText } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true}/>);
    expect(getByText('Source Data')).toBeInTheDocument();
    expect(getByText('proteinId')).toBeInTheDocument();
    expect(getByText('123EAC')).toBeInTheDocument();
    expect(getByText('@proteinType')).toBeInTheDocument();
    expect(getByText('home')).toBeInTheDocument();
    expect(getByText(/nutFree:/)).toBeInTheDocument();
    expect(getByText('testName1')).toBeInTheDocument();
  });

  test('Nested entity data renders properly',() => {
    let entityTypePropertiesUpdated = [
        { name: 'propId', type: 'int' },
        { name: 'propName', type: 'string' },
        { name: 'items', type: 'parent-ItemType [ ]'},
        { name: 'items/type', type: 'string'},
        { name: 'items/category', type: 'parent-catItem'},
        { name: 'items/category/itemProdCat1', type: 'string'},
        { name: 'items/category/itemProdCat2', type: 'string'}
        
      ]
    const { getByText,getByTestId,queryByText,getByLabelText,getAllByText } = render(<SourceToEntityMap {...data.mapProps} mappingVisible={true} entityTypeProperties={entityTypePropertiesUpdated}/>);
    expect(getByText('propId')).toBeInTheDocument();
    expect(getByText('propName')).toBeInTheDocument();
    expect(getByText('items')).toBeInTheDocument();
    expect(getByText('type')).toBeInTheDocument();
    expect(getByText('category')).toBeInTheDocument();
    expect(getAllByText('Context').length).toBe(2);
    expect(getByText('ItemType [ ]')).toBeInTheDocument();
    expect(getByText('itemProdCat1')).toBeInTheDocument();
    expect(getByText('itemProdCat2')).toBeInTheDocument();
    //TO DO: Below tests can be done when working on E2E tests.
    //fireEvent.click(getByLabelText('icon: down'));
    //expect(queryByText('category')).not.toBeInTheDocument();
  })
});
