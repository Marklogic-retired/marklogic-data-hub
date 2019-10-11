import React, { useState } from 'react';

type SearchContextInterface = {
  query: string,
  entityNames: string[],
  start: number,
  pageLength: number,
  searchFacets: any
}

const defaultSearchOptions = {
  query: '', 
  entityNames: [],
  start: 1,
  pageLength: 10,
  searchFacets: {} 
}

interface ISearchContextInterface {
  searchOptions: SearchContextInterface;
  setQuery: (searchString: string) => void;
  setPage: (pageNumber: number) => void;
  setPageLength: (current: number, pageSize: number) => void;
  setSearchFacets: (constraint, vals) => void;
  setEntity: (option: string) => void;
  clearEntity: () => void;
  setEntityClearQuery: (option: string) => void;
  setLatestJobFacet : (option: string) => void;
}

export const SearchContext = React.createContext<ISearchContextInterface>({
  searchOptions: defaultSearchOptions,
  setQuery: () => {},
  setPage: () => {},
  setPageLength: () => {},
  setSearchFacets: () => {},
  setEntity: () => {},
  clearEntity: () => {},
  setEntityClearQuery: () => {},
  setLatestJobFacet : () =>{}
});

const SearchProvider: React.FC<{ children: any }> = ({children}) => {
  
  const [searchOptions, setSearchOptions] = useState<SearchContextInterface>(defaultSearchOptions);

  const setQuery = (searchString: string) => {
    console.log('The user typed string is ' + searchString);
    setSearchOptions({...searchOptions, start: 1, query: searchString});
  }

  const setPage = (pageNumber: number) => {
    console.log('The user selected page ' + pageNumber);
    setSearchOptions({...searchOptions, start: pageNumber});
  }

  const setPageLength = (current: number, pageSize: number) => {
    console.log('The user changed page length ' + pageSize);
    setSearchOptions({ ...searchOptions, pageLength: pageSize, start: 1});
  }

  const setSearchFacets = (constraint, vals) => {
    console.log('Updated a facet ' + constraint + ': ' + vals);
    let facets = {};
    if (vals.length > 0) {
      facets = {...searchOptions.searchFacets, [constraint]: vals};
    } else {
      facets = { ...searchOptions.searchFacets };
      delete facets[constraint];
    }
    setSearchOptions({ ...searchOptions, start: 1, searchFacets: facets });
  }

  const setEntity = (option: string) => {
    console.log('Selected Option is ' + option);
    setSearchOptions({ ...searchOptions, searchFacets: {}, entityNames: [option]});
  }

  const clearEntity = () => {
    setSearchOptions({ ...searchOptions, searchFacets: {}, entityNames: []});
  }

  const setEntityClearQuery = (option: string) => {
    console.log('Selected Option is ' + option);
    setSearchOptions({ ...searchOptions, query: '', entityNames: [option]});
  }

  const setLatestJobFacet = (vals) => {
    let facets = {};
      facets = {['createdByJobRange']: [vals]};
    setSearchOptions({ ...searchOptions, start: 1, searchFacets: facets,entityNames: []});
  }

  return (
    <SearchContext.Provider value={{ searchOptions, setQuery, setPage, setPageLength, setSearchFacets, setEntity, clearEntity, setEntityClearQuery,setLatestJobFacet }}>
      {children}
    </SearchContext.Provider>
  )
}

export default SearchProvider;