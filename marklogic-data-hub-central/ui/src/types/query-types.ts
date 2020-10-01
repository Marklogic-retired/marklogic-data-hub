export interface QueryOptions {
    searchText: string;
    entityTypeIds: string[];
    selectedFacets: {};
    selectedQuery: string;
    propertiesToDisplay: string[];
    zeroState: boolean;
    manageQueryModal: boolean;
    sortOrder: any[];
    database: string;
  }