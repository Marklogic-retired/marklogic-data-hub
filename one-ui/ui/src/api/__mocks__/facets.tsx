import { numericRange } from '../../assets/mock-data/facet'

export const rangeFacet = async () => {
    return await new Promise((resolve) => {
        resolve(numericRange)
    })
}