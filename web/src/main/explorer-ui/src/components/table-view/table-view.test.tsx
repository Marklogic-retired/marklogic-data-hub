import React from 'react';
import { shallow, mount } from 'enzyme';
import TableView from '../../components/table-view/table-view';
import MockDocument from '../../assets/example';


describe("Table view component", () => {

    let wrapper;

    beforeAll(() => {
        wrapper = mount(<TableView document={MockDocument}/>)
      });

    test("renders", () => {
        const wrapper = shallow(<TableView document={MockDocument}/>)
        expect(wrapper.exists()).toBe(true);
    }) 

    test("table view renders", () => {
        expect(wrapper.find('.ant-table-tbody')).toHaveLength(1);
    }) 

})
