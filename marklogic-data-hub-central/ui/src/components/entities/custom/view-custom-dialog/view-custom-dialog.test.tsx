import React from 'react';
import { render, cleanup, wait } from '@testing-library/react';
import data from "../../../../assets/mock-data/curation/common.data";
import ViewCustomDialog from "./view-custom-dialog";

describe('View Custom artifact component', () => {

  afterEach(cleanup);

  test('Verify View Custom Dialog renders ', () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(<ViewCustomDialog {...data.viewCustom} />);

    expect(getByText('View Custom Step')).toBeInTheDocument();
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
