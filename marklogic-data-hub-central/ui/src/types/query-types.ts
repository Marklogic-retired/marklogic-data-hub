export interface QueryOptions {
    searchText: string;
    entityTypeIds: string[];
    selectedFacets: {};
    selectedQuery: string;
    propertiesToDisplay: string[];
    sortOrder: any[];
    database: string;
  }

export interface pagePropertiesType {
    start: number,
    pageNumber: number,
    pageLength: number,
    pageSize: number,
    maxRowsPerPage: number,
}
