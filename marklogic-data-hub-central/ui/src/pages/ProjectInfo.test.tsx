import React from 'react';
import {render, cleanup, fireEvent} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import ProjectInfo from './ProjectInfo';

describe('ProjectInfo component', () => {

    afterEach(() => {
        cleanup();
    });

    test('should verify project info display', async () => {
        const { getByText } = render(<ProjectInfo/>);
        expect(getByText('Manage Project')).toBeInTheDocument();
        expect(getByText('Data Hub Version:')).toBeInTheDocument();
        expect(getByText('MarkLogic Version:')).toBeInTheDocument();
        expect(getByText('Project name:')).toBeInTheDocument();
        expect(getByText('Download')).toBeInTheDocument();
    });
});
