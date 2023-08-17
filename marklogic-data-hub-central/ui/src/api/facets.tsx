import axiosInstance from "@config/axios.ts";

export const rangeFacet = async (props, database) => {
  return await axiosInstance({
    method: "POST",
    url: `/api/entitySearch/facet-values/range?database=${database}`,
    data: {
      "referenceType": props.referenceType,
      "entityTypeId": props.entityTypeId,
      "propertyPath": props.propertyPath,
    },
  });
};

export const stringSearch = async data => {
  return await axiosInstance({
    method: "POST",
    url: `/api/entitySearch/facet-values`,
    data: data,
  });
};

export const getRelatedConcepts = async (database: string) => {
  return await axiosInstance.post(`/api/entitySearch/getEntitiesWithConceptsTypes?database=${database}`);
};
