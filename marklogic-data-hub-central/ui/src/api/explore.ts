import axios from "axios";

export const fetchResults = async (database: string, entitiesList, searchOptions: any) => {
  const {query, selectedFacets, selectedTableProperties, start, pageLength, sortOrder} = searchOptions;
  const {data} = await axios({
    method: "POST",
    url: `/api/entitySearch?database=${database}`,
    data: {
      query: {
        searchText: query,
        entityTypeIds: entitiesList,
        selectedFacets,
      },
      propertiesToDisplay: selectedTableProperties,
      start,
      pageLength,
      sortOrder
    }
  });
  return data;
};