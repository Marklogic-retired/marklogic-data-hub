import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import ConfirmYesNo from "./confirm-yes-no";
import { ConfirmYesNoMessages } from '../../../config/messages.config';

jest.mock('axios');

describe('Confirm yes/no component', () => {

  afterEach(cleanup);

  const props = {
    visible: true,
    type: 'discardChanges',
    onYes: jest.fn(),
    onNo: jest.fn(),
  }

  test('Verify confirm yes/no renders with defaults', () => {
    const { getByText } = render(
        <ConfirmYesNo {...props} />
    );
    expect(getByText(ConfirmYesNoMessages[props.type])).toBeInTheDocument();

    const yesButton = getByText('Yes');
    yesButton.onclick = jest.fn();
    fireEvent.click(yesButton);
    expect(yesButton.onclick).toHaveBeenCalledTimes(1);
    
    const noButton = getByText('No');
    noButton.onclick = jest.fn();
    fireEvent.click(noButton);
    expect(noButton.onclick).toHaveBeenCalledTimes(1);

  });

  test('Verify confirm yes/no renders with custom props', () => {
    const { getByText } = render(
        <ConfirmYesNo {...props} type='saveChanges' labelYes='altYes' labelNo='altNo' />
    );
    expect(getByText(ConfirmYesNoMessages['saveChanges'])).toBeInTheDocument();
    expect(getByText('altYes')).toBeInTheDocument();
    expect(getByText('altNo')).toBeInTheDocument();
  });

});
