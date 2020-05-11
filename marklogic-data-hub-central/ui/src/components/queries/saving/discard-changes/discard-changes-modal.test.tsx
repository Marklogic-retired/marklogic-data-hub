import React from 'react';
import { render } from "@testing-library/react";
import DiscardChangesModal from './discard-changes-modal';

describe("<DiscardChangesModal/>", () => {

    test("Verify Discard changes modal appears with current query name", () => {
        const { getByText } = render(<DiscardChangesModal
            currentQueryName = {'My Saved Query'}
            setDiscardChangesModalVisibility = {jest.fn()}
            savedQueryList={[]}
            toggleApply={jest.fn()}
            toggleApplyClicked={jest.fn()}
        />)

        getByText((content, node) => {
            const hasText = node => node.textContent === "Are you sure you want to discard all changes made to My Saved Query ?";
            const nodeHasText = hasText(node);
            const childrenDontHaveText = Array.from(node.children).every(
                child => !hasText(child)
            );
            return nodeHasText && childrenDontHaveText;
        });
        expect(getByText('Yes')).toBeVisible();
        expect(getByText('No')).toBeVisible();
    });
});
