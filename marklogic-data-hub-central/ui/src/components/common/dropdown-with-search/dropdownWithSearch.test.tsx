import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DropDownWithSearch from './dropdownWithSearch';
import data from "../../../assets/mock-data/common.data";

describe('DropDownWithSearch component', () => {

  test('DropDownWithSearch component renders ', () => {
      const {container} = render(<DropDownWithSearch {...data.dropDownWithSearch} />);
      expect(container.querySelector('#dropdownList')).toBeInTheDocument();
  });
});
