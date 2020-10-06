import React from 'react';
import { render } from '@testing-library/react';
import DropDownWithSearch from './dropdownWithSearch';
import data from "../../../assets/mock-data/curation/common.data";

describe('DropDownWithSearch component', () => {
  const minWidth = '168px;';
  const maxWidth = '400px;';

  test('DropDownWithSearch component renders ', () => {
      const {container} = render(<DropDownWithSearch {...data.dropDownWithSearch} />);
      expect(container.querySelector('#dropdownList')).toBeInTheDocument();
  });

  test('DropDownWithSearch component has minWidth', () => {
    const { container } = render(<DropDownWithSearch {...data.dropDownWithSearch} />);
    expect(container.querySelector('#dropdownList')).toHaveStyle('width: ' + minWidth);
  });

  test('DropDownWithSearch component has maxWidth', () => {
    const { container } = render(<DropDownWithSearch {...data.dropDownWithSearch} indentList={[500, 500]} />);
    expect(container.querySelector('#dropdownList')).toHaveStyle('width: ' + maxWidth);
  });
});
