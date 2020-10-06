import axios from "axios";

export const rangeFacet = async (props) => {
  return await axios({
    method: 'POST',
    url: `/api/entitySearch/facet-values/range`,
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
