import axios from "axios";

export const rangeFacet = async (props) => {
  return await axios({
    method: 'POST',
    url: `/api/search/facet-values/range`,
    data: {
      "referenceType": props.referenceType,
      "entityTypeId": props.entityTypeId,
      "propertyPath": props.propertyPath
    }
  });
}

