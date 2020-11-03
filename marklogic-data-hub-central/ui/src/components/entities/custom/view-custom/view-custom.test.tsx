import React from 'react';
import { render, cleanup, wait } from '@testing-library/react';
import data from "../../../../assets/mock-data/curation/common.data";
import ViewCustom from "./view-custom";

describe('View Custom artifact component', () => {

  afterEach(cleanup);

  test('Verify View Custom Dialog renders ', () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(<ViewCustom {...data.viewCustom} />);

    expect(getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter name')).toHaveValue('customJSON');
    expect(getByPlaceholderText('Enter description')).toBeInTheDocument();
    expect(getByLabelText('Collection')).toBeInTheDocument();
    expect(getByLabelText('Query')).toBeInTheDocument();
    expect(getByLabelText('Query')).toBeChecked();
    expect(getByPlaceholderText("Enter Source Query")).toHaveValue("cts.collectionQuery(['loadCustomerJSON'])");
    expect(getByText('Save')).toBeDisabled();
    expect(getByText('Cancel')).toBeEnabled();
  });

});
