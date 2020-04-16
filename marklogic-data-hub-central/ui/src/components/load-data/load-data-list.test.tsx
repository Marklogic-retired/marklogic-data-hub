import React from 'react';
import { render, fireEvent, wait, within } from '@testing-library/react';
import LoadDataList from './load-data-list';
import data from '../../config/data.config';

describe('Load data component', () => {

  test('Verify loadData list view renders correctly with no data', () => {
    const { getByText } = render(<LoadDataList {...data.loadData} data={[]} />)
    const tableColumns = within(getByText('Name').closest('tr'));
    
    expect(getByText('Add New')).toBeInTheDocument();
    expect(tableColumns.getByText('Name')).toBeInTheDocument();
    expect(tableColumns.getByText('Description')).toBeInTheDocument();
    expect(tableColumns.getByText('Source Format')).toBeInTheDocument();
    expect(tableColumns.getByText('Target Format')).toBeInTheDocument();
    expect(tableColumns.getByText('Last Updated')).toBeInTheDocument();
    expect(tableColumns.getByText('Action')).toBeInTheDocument();
    expect(getByText('No Data')).toBeInTheDocument();
  })

  test('Verify loadData list view renders correctly with data', () => {
    const { getByText, getAllByLabelText } = render(<LoadDataList {...data.loadData} />)
    const dataRow = within(getByText('load2').closest('tr'));
    
    expect(dataRow.getByText(data.loadData.data[1].name)).toBeInTheDocument();
    expect(dataRow.getByText(data.loadData.data[1].description)).toBeInTheDocument();
    expect(dataRow.getByText(data.loadData.data[1].sourceFormat)).toBeInTheDocument();
    expect(dataRow.getByText(data.loadData.data[1].targetFormat)).toBeInTheDocument();
    expect(dataRow.getByText('04/15/2020 2:22PM')).toBeInTheDocument();
    expect(dataRow.getByTestId('load2-settings')).toBeInTheDocument();
    expect(dataRow.getByTestId('load2-delete')).toBeInTheDocument();

    expect(getAllByLabelText('icon: setting').length).toBe(2);
  })

  test('Verify loadData settings from list view renders correctly', async () => {
    const { getByText, getByTestId } = render(<LoadDataList {...data.loadData} />)

    await wait(() => {
      fireEvent.click(getByTestId(data.loadData.data[0].name+'-settings'));
    })
    expect(getByText('Activity Settings'));
  })
});