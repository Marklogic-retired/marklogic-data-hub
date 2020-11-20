import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SwitchView from './switch-view';

export type ViewType =  'card' | 'list';

describe('Switch view component', () => {

  const INITIAL_VIEW: ViewType = 'card';

  afterEach(cleanup);

  test('Verify styles of selected buttons', () => {

    const { getByLabelText } = render(
      <SwitchView handleSelection={() => null} defaultView={INITIAL_VIEW} />
    );

    expect(getByLabelText('switch-view')).toBeInTheDocument();

    expect(getByLabelText('switch-view-card')).toHaveProperty('checked', true);
    expect(getByLabelText('switch-view-list')).toHaveProperty('checked', false);
    fireEvent.mouseOver(getByLabelText('switch-view-list'));
    expect(getByLabelText('switch-view-list')).toHaveStyle('color: rgb(127, 134, 181');
    fireEvent.click(getByLabelText('switch-view-list'));
    expect(getByLabelText('switch-view-card')).toHaveProperty('checked', false);
    expect(getByLabelText('switch-view-list')).toHaveProperty('checked', true);
    fireEvent.mouseOver(getByLabelText('switch-view-card'));
    expect(getByLabelText('switch-view-card')).toHaveStyle('color: rgb(127, 134, 181');
  });

});
