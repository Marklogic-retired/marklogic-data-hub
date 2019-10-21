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
  setSearchFacets: (constraint: string, vals: string[]) => void;
  setEntity: (option: string) => void;
  setEntityClearQuery: (option: string) => void;
  setLatestJobFacet: (vals: string) => void;
  clearFacet: (constraint:string, val:string) => void;
  clearAllFacets: () => void;
  setDateFacet: (dates: string[]) => void;
  clearDateFacet: () => void;
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
  clearDateFacet: () => {}
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

  const setSearchFacets = (constraint: string, vals: string[]) => {
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
    if (option) {
      setSearchOptions({ ...searchOptions, start: 1, searchFacets: {}, entityNames: [option]});
    } else {
      setSearchOptions({ ...searchOptions, start: 1, searchFacets: {}, entityNames: []});
    }
  }

  const setEntityClearQuery = (option: string) => {
    console.log('Selected Option is ' + option);
    setSearchOptions({ ...searchOptions, query: '', start: 1, searchFacets:{}, entityNames: [option]});
  }

  const setLatestJobFacet = (vals: string) => {
    let facets = {};
      facets = { createdByJob: [vals] };
    setSearchOptions({ ...searchOptions, start: 1, searchFacets: facets, entityNames: []});
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
    setSearchOptions({ ...searchOptions, searchFacets: {} });
  }

  const setDateFacet = (dates: string[]) => {
    setSearchOptions({ ...searchOptions, searchFacets: {...searchOptions.searchFacets, createdOnRange: dates} });
  }

  const clearDateFacet = () => {
    let facets = searchOptions.searchFacets;
    if (facets.hasOwnProperty('createdOnRange')){
      delete facets.createdOnRange;
      setSearchOptions({ ...searchOptions, searchFacets: facets });
    }
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
      clearDateFacet
      }}>
      {children}
    </SearchContext.Provider>
  )
}

export default SearchProvider;