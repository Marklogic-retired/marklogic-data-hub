import React from 'react';
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import Toolbar from './toolbar';
import tiles from '../../config/tiles.config'

describe('Toolbar component', () => {

    it('renders with clickable tools', () => {
        const mockClick = jest.fn()
        const {getByLabelText} = render(<Toolbar tiles={tiles} onClick={mockClick} />);
        const tools = Object.keys(tiles);

        expect(getByLabelText("toolbar")).toBeInTheDocument();

        tools.forEach((tool, i) => {
            expect(getByLabelText("tool-" + tool)).toBeInTheDocument();
            fireEvent.click(getByLabelText("tool-" + tool));
            expect(mockClick.mock.calls.length).toBe(i+1);
            expect(mockClick.mock.calls[i][0]).toBe(tool);
        })

    });

});
