import { numericRange, stringSearchResponse } from '../../assets/mock-data/facet';

export const rangeFacet = async () => {
    return await new Promise((resolve) => {
        resolve(numericRange);
    });
};

export const stringSearch = async () => {
    return await new Promise((resolve) => {
        resolve(stringSearchResponse);
    });
};
