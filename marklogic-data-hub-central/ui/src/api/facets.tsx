import axios from "axios";

export const rangeFacet = async (props, database) => {
  return await axios({
    method: 'POST',
    url: `/api/entitySearch/facet-values/range?database=${database}`,
    data: {
      "referenceType": props.referenceType,
      "entityTypeId": props.entityTypeId,
      "propertyPath": props.propertyPath
    }
  });
};

export const stringSearch = async (data) => {
    return await axios({
        method: 'POST',
        url: `/api/entitySearch/facet-values`,
        data: data
    });
};
