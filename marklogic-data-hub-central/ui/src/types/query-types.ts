export interface QueryOptions {
    searchText: string;
    entityTypeIds: string[];
    selectedFacets: {};
    selectedQuery: string;
    propertiesToDisplay: string[];
    zeroState: boolean;
    sortOrder: any[];
    database: string;
  }