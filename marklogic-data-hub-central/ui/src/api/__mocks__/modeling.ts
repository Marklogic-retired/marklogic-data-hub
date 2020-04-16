import { getEntityTypes, createModelResponse, createModelErrorResponse } from '../../assets/mock-data/modeling';

export const primaryEntityTypes = async () => {
  return await new Promise((resolve) => {
    resolve(getEntityTypes)
  })
}


