import React, { useState } from 'react';

type SearchContextInterface = {
  query: string,
  entityNames: string[],
  start: number,
  pageNumber: number,
  pageLength: number,
  pageSize: number,
  searchFacets: any
}

const defaultSearchOptions = {
  query: '', 
  entityNames: [],
  start: 1,
  pageNumber: 1,
  pageLength: 10,
  pageSize: 10,
  searchFacets: {}
}

interface ISearchContextInterface {
  searchOptions: SearchContextInterface;
  setQuery: (searchString: string) => void;
  setPage: (pageNumber: number, totalDocuments: number) => void;
  setPageLength: (current: number, pageSize: number) => void;
  setSearchFacets: (constraint: string, vals: string[]) => void;
  setEntity: (option: string) => void;
  setEntityClearQuery: (option: string) => void;
  setLatestJobFacet: (vals: string) => void;
  clearFacet: (constraint:string, val:string) => void;
  clearAllFacets: () => void;
  setDateFacet: (dates: string[]) => void;
  clearDateFacet: () => void;
  resetSearchOptions: () => void;
}

export const SearchContext = React.createContext<ISearchContextInterface>({
  searchOptions: defaultSearchOptions,
  setQuery: () => {},
  setPage: () => {},
  setPageLength: () => {},
  setSearchFacets: () => {},
  setEntity: () => {},
  setEntityClearQuery: () => {},
  setLatestJobFacet : () =>{},
  clearFacet: () => {},
  clearAllFacets: () => {},
  setDateFacet: () => {},
  clearDateFacet: () => {},
  resetSearchOptions: () => {}
});

const SearchProvider: React.FC<{ children: any }> = ({children}) => {
  
  const [searchOptions, setSearchOptions] = useState<SearchContextInterface>(defaultSearchOptions);

  const setQuery = (searchString: string) => {
    console.log('The user typed string is ' + searchString);
    setSearchOptions({
      ...searchOptions,
      start: 1,
      query: searchString,
      pageNumber: 1,
      pageLength: searchOptions.pageSize
    });
  }

  const setPage = (pageNumber: number, totalDocuments: number) => {
    let pageLength = searchOptions.pageSize;
    let start = pageNumber === 1 ?  1 : (pageNumber -1) * searchOptions.pageSize + 1;

    if ( (totalDocuments - ((pageNumber - 1) * searchOptions.pageSize)) < searchOptions.pageSize ) {
      pageLength = (totalDocuments - ((pageNumber - 1) * searchOptions.pageLength))
    }
    setSearchOptions({
      ...searchOptions,
      start,
      pageNumber,
      pageLength
    });
  }

  const setPageLength = (current: number, pageSize: number) => {
    console.log('The user changed page length ' + pageSize);
    setSearchOptions({ 
      ...searchOptions,
      start: 1,
      pageNumber: 1,
      pageLength: pageSize,
      pageSize
    });
  }

  const setSearchFacets = (constraint: string, vals: string[]) => {
    console.log('Updated a facet ' + constraint + ': ' + vals);
    let facets = {};
    if (vals.length > 0) {
      facets = {...searchOptions.searchFacets, [constraint]: vals};
    } else {
      facets = { ...searchOptions.searchFacets };
      delete facets[constraint];
    }
    setSearchOptions({ 
      ...searchOptions,
      start: 1,
      searchFacets: facets,
      pageNumber: 1,
      pageLength: searchOptions.pageSize
    });
  }

  const setEntity = (option: string) => {
    console.log('Selected Option is ' + option);
    if (option) {
      setSearchOptions({ 
        ...searchOptions,
        start: 1,
        searchFacets: {},
        entityNames: [option],
        pageLength: searchOptions.pageSize
      });
    } else {
      setSearchOptions({
        ...searchOptions,
        start: 1,
        searchFacets: {},
        entityNames: [],
        pageNumber: 1,
        pageLength: searchOptions.pageSize
      });
    }
  }

  const setEntityClearQuery = (option: string) => {
    console.log('Selected Option is ' + option);
    setSearchOptions({ 
      ...searchOptions,
      query: '',
      start: 1,
      searchFacets:{},
      entityNames: [option],
      pageNumber: 1,
      pageLength: searchOptions.pageSize,
    });
  }

  const setLatestJobFacet = (vals: string) => {
    let facets = {};
      facets = { createdByJob: [vals] };
    setSearchOptions({ 
      ...searchOptions,
      start: 1,
      searchFacets: facets,
      entityNames: [],
      pageNumber: 1,
      pageLength: searchOptions.pageSize
    });
  }

  const clearFacet = (constraint: string, val: string) => {
    let facets = searchOptions.searchFacets;
    if (facets[constraint].length > 1) {
      facets[constraint] = facets[constraint].filter( option => option !== val );
    } else {
      delete facets[constraint]
    }
    setSearchOptions({ ...searchOptions, searchFacets: facets })
  }

  const clearAllFacets = () => {
    setSearchOptions({ 
      ...searchOptions,
      searchFacets: {},
      start: 1,
      pageNumber: 1,
      pageLength: searchOptions.pageSize 
    });
  }

  const setDateFacet = (dates: string[]) => {
    setSearchOptions({ 
      ...searchOptions,
      start: 1,
      pageNumber: 1,
      pageLength: searchOptions.pageSize,
      searchFacets: {
        ...searchOptions.searchFacets,
        createdOnRange: dates
      }
    });
  }

  const clearDateFacet = () => {
    let facets = searchOptions.searchFacets;
    if (facets.hasOwnProperty('createdOnRange')){
      delete facets.createdOnRange;
      setSearchOptions({ 
        ...searchOptions,
        searchFacets: facets,
        start: 1,
        pageNumber: 1,
        pageLength: searchOptions.pageSize
      });
    }
  }

  const resetSearchOptions = () => {
    setSearchOptions({ ...defaultSearchOptions});
  }


  return (
    <SearchContext.Provider value={{ 
      searchOptions,
      setQuery,
      setPage,
      setPageLength,
      setSearchFacets,
      setEntity,
      setEntityClearQuery,
      clearFacet,
      clearAllFacets,
      setLatestJobFacet,
      setDateFacet,
      clearDateFacet,
      resetSearchOptions
      }}>
      {children}
    </SearchContext.Provider>
  )
}

export default SearchProvider;