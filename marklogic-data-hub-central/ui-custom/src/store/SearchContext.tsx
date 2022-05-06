import React, {useEffect, useState, useContext} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {UserContext} from "../store/UserContext";
import {getSearchResults, getSearchResultsByGet} from "../api/api";
import _ from "lodash";

interface SearchContextInterface {
  qtext: string;
  entityType: any;
  facetStrings: string[];
  searchResults: any;
  start: number;
  pageLength: number;
  returned: number;
  total: number;
  recentSearches: any;
  loading: boolean;
  queryString: string;
  pageNumber: number;
  sortOrder: string,
  handleSearch: any;
  handleFacetString: any;
  handleFacetDateRange: any;
  handlePagination: any;
  handleQueryFromParam: any;
  handleGetSearchLocal: any;
  setPageNumber: (value: number) => void;
  handleDeleteAllRecent: any;
  hasSavedRecords: any;
  handleSort: any;
}
interface QueryInterface {
  searchText: string;
  entityTypeIds: string[];
  selectedFacets: any;
}

const defaultState = {
  qtext: "",
  entityType: "",
  facetStrings: [],
  searchResults: {},
  start: 0,
  pageLength: 10,
  returned: 0,
  total: 0,
  recentSearches: [],
  loading: false,
  queryString: "",
  pageNumber: 1,
  sortOrder: "",
  handleSearch: () => { },
  handleFacetString: () => { },
  handleFacetDateRange: () => { },
  handlePagination: () => { },
  handleQueryFromParam: () => { },
  handleGetSearchLocal: () => { },
  setPageNumber: () => { },
  handleDeleteAllRecent: () => { },
  hasSavedRecords: () => { },
  handleSort: () => { },
};

/**
 * Component for storing state of search query and search results.
 * Also provides methods for executing searches.
 * Made available to components that perform searches or display search results.
 *
 * @component
 * @prop {string} qtext - Search query text (e.g., from SearchBox).
 * @prop {string[]} facetStrings  Array of facet selections (["Widget:Foo", "Widget:Bar"]).
 * @prop {object} searchResults - Search results object.
 * @prop {number} returned - Number of records returned in search results.
 * @prop {number} total - Total number of records available.
 * @prop {HandleSearch} handleSearch - Callback to execute a search via query text (TODO document interface).
 * @prop {HandleFacetString} handleFacetString - Callback to execute a search via facet selection (TODO document interface).
 * @prop {HandleFacetDateRange} handleFacetDateRange - Callback to execute a search via facet selection for date range widgets(TODO document interface).
 * @prop {HandleSaved} handleSaved - Callback to execute a search via selection of a saved query (TODO document interface).
 * @example
 * TBD
 */
export const SearchContext = React.createContext<SearchContextInterface>(defaultState);

const SearchProvider: React.FC = ({children}) => {

  const userContext = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();

  const startInit = 1;
  const pageLengthInit = 10;
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [start, setStart] = useState<number>(startInit);
  const [pageLength, setPagePength] = useState<number>(pageLengthInit);
  const [returned, setReturned] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [qtext, setQtext] = useState<string>("");
  const [entityType, setEntityType] = useState<any>("");
  const [facetStrings, setFacetStrings] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any>({});
  const [newSearch, setNewSearch] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [queryString, setQueryString] = useState<string>("");
  const [sortOrder, setSortOrder] = useState("");
  const [sortBy, setSortBy] = useState("");

  const getFacetType = (facetValue) => {
    const regexDateRange = /^\d{4}-\d{2}-\d{2} ~ \d{4}-\d{2}-\d{2}$/;
    if (regexDateRange.test(facetValue)) {
      return "dateRange";
    } else {
      return "category";
    }
  };

  const buildQuery = (_start, _pageLength, _qtext, _facetStrings, _entityType): QueryInterface => {
    let query = {
      start: _start,
      pageLength: _pageLength,
      searchText: _qtext,
      entityTypeIds: Array.isArray(_entityType) ? _entityType : [_entityType],
      selectedFacets: {},
      sort: {},
    };
    if (sortBy) {
      query.sort = {
        entityType: _entityType,
        property: sortBy,
        order: sortOrder
      };
    }
    if (facetStrings && facetStrings.length > 0) {
      facetStrings.forEach(fs => {
        const parts = fs.split(":");
        if (getFacetType(parts[1]) === "category") {
          if (query.selectedFacets[parts[0]]) {
            query.selectedFacets[parts[0]].push(parts[1]);
          } else {
            query.selectedFacets[parts[0]] = [parts[1]];
          }
        } else if (getFacetType(parts[1]) === "dateRange") {
          let range = parts[1].replace(/ ~ /g, ",").split(",");
          let rangeObj = {
            min: range[0],
            max: range[1]
          };
          query.selectedFacets[parts[0]] = rangeObj;
        }
      });
    }
    return query;
  };
  const handleSort = (sortBy, sortOrder) => {
    setSortOrder(sortOrder);
    setSortBy(sortBy);
    setNewSearch(true);
  };

  useEffect(() => {
    if (newSearch) {
      setNewSearch(false);
      setLoading(true);
      let newQuery = buildQuery(start, pageLength, qtext, facetStrings, entityType);
      let newQueryStr = encodeURI(JSON.stringify(newQuery));
      setQueryString(newQueryStr);
      let sr = getSearchResultsByGet(newQueryStr, userContext.userid);
      if (location.pathname !== "/search?query=" + newQueryStr) {
        navigate("/search?query=" + newQueryStr); // Handle search submit from another view
      }
      sr.then(result => {
        // Ensure search response result is an array
        if (result && !Array.isArray(result?.data?.searchResults?.response?.result)) {
          result.data.searchResults.response.result = [result.data.searchResults.response.result];
        }
        setSearchResults(result?.data.searchResults.response);
        setReturned(parseInt(result?.data.searchResults.response.total));
        setTotal(_.get(result?.data, userContext.config.search.meter.config.totalPath, null) || 0);
        handleSaveSearchLocal();
        handleGetSearchLocal();
        setNewSearch(false);
        setLoading(false);
      }).catch(error => {
        console.error(error);
      });
    }
  }, [newSearch]);

  const handleSearch = async (_qtext = null, _entityType = null) => {
    if (_qtext !== null) {
      setQtext(_qtext);
    }
    if (_entityType !== null) {
      setEntityType(_entityType);
    } else {
      // If entityType hasn't been set, use search.defaultEntity if available
      setEntityType(userContext?.config?.search?.defaultEntity || "");
    }
    setPageNumber(1);
    setStart(1);
    setNewSearch(true);
  };

  const handleFacetString = async (name, value, selected) => {
    if (selected) {
      let newFacetString = name + ":" + value;
      setFacetStrings(prevState => [...prevState, newFacetString]);
    } else {
      let newFacetStrings = facetStrings.filter(f => (f !== (name + ":" + value)));
      setFacetStrings(newFacetStrings);
    }
    setPageNumber(1);
    setStart(1);
    setNewSearch(true);
  };

  const handleFacetDateRange = async (name, value, selected) => {
    if (selected) {
      let newFacetString = name + ":" + value;
      let newFacet = facetStrings.filter(f => (f.split(":")[0] !== (name)));
      setFacetStrings(newFacet);
      setFacetStrings(prevState => [...prevState, newFacetString]);
    } else {
      let newFacetStrings = facetStrings.filter(f => (f.split(":")[0] !== (name)));
      setFacetStrings(newFacetStrings);
    }
    setPageNumber(1);
    setStart(1);
    setNewSearch(true);
  };

  const handlePagination = async (_pageNumber = 1, _start = null, _pageLength = null) => {
    if (_pageNumber !== pageNumber) {
      setPageNumber(_pageNumber);
    }
    if (_start !== null) {
      setStart(_start);
    }
    if (_pageLength !== null) {
      setPagePength(_pageLength);
    }
    setNewSearch(true);
  };

  const handleQueryFromParam = (queryParsed) => {
    if (queryParsed.searchText) {
      setQtext(queryParsed.searchText);
    }
    if (queryParsed.entityTypeIds !== "") {
      setEntityType(queryParsed.entityTypeIds);
    } else {
      // If entityType hasn't been set, use search.defaultEntity if available
      setEntityType(userContext.config.search.defaultEntity || "");
    }
    if (queryParsed.selectedFacets) {
      let newFacetStrings: string[] = [];
      for (const k of Object.keys(queryParsed.selectedFacets)) {
        if (queryParsed.selectedFacets[k].min && queryParsed.selectedFacets[k].max) {
          newFacetStrings.push(k + ":" + queryParsed.selectedFacets[k].min + " ~ " + queryParsed.selectedFacets[k].max);
        } else {
          for (const v of queryParsed.selectedFacets[k]) {
            newFacetStrings.push(k + ":" + v);
          }
        }
      }
      setFacetStrings(newFacetStrings);
    }
    setNewSearch(true);
  };

  const handleGetSearchLocal = () => {
    // Get from local storage
    let json = localStorage.getItem("search");
    let obj = json ? JSON.parse(json) : null;
    let sortedObj: any = {}, sortedQueries: any = [];
    if (obj && obj[userContext.userid]) {
      sortedObj = _.fromPairs(_.sortBy(_.toPairs(obj[userContext.userid]), 1).reverse());
      sortedQueries = Object.keys(sortedObj);
      sortedQueries = sortedQueries.map(q => {
        return JSON.parse(decodeURI(q));
      });
    }
    if (sortedQueries.length > 0) {
      setLoading(true);
      setRecentSearches(sortedQueries);
      setLoading(false);
    } else {
      setRecentSearches([]);
    }
  };

  const handleSaveSearchLocal = async () => {
    // If not configured, don't execute
    if (!userContext?.config?.dashboard?.recentSearches) return;
    // Save to local storage
    let json = localStorage.getItem("search");
    let dt = new Date().toISOString();
    let newObj = {};
    if (!qtext && facetStrings.length === 0) return;
    let newQuery = buildQuery(startInit, pageLengthInit, qtext, facetStrings, entityType);
    let key = encodeURI(JSON.stringify(newQuery));
    if (!json) {
      newObj[userContext.userid] = {};
      newObj[userContext.userid][key] = dt;
      localStorage.setItem("search", JSON.stringify(newObj));
    } else {
      newObj = JSON.parse(json);
      let obj;
      if (newObj && newObj[userContext.userid]) {
        obj = newObj[userContext.userid];
        newObj[userContext.userid][key] = dt;
      } else {
        newObj[userContext.userid] = {};
        newObj[userContext.userid][key] = dt;
      }
      localStorage.setItem("search", JSON.stringify(newObj));
      // Handle deletion of searches in local storage when over configured count and time limit
      if (obj) {
        await handleDeleteRecentByMaxEntries(obj);
        await handleDeleteRecentByMaxTime(obj);
        localStorage.setItem("search", JSON.stringify(newObj));
      }
    }
  };

  const handleDeleteRecentByMaxEntries = (obj) => {
    let maxEntries = userContext.config.dashboard.recentSearches.maxEntries;
    if (Object.keys(obj).length > maxEntries) { delete obj[Object.keys(obj)[0]]; }
  };

  const handleDeleteRecentByMaxTime = (obj) => {
    let maxTime = userContext.config.dashboard.recentSearches.maxTime;
    let curr = new Date();
    for (let i=0;i<Object.keys(obj).length;i++) {
      let itemStorageTime = new Date(obj[Object.keys(obj)[i]]);
      let diffMilliSeconds = curr.getTime() - itemStorageTime.getTime();
      let diffMinutes = diffMilliSeconds/60000;
      if (diffMinutes > maxTime) {
        delete obj[Object.keys(obj)[i]];
        i--;
      }
    }
  };

  const handleDeleteAllRecent = () => {
    localStorage.removeItem("search");
    handleGetSearchLocal();
  };

  const hasSavedRecords = () => {
    let json = localStorage.getItem("search");
    let obj = json ? JSON.parse(json) : null;
    return obj && obj[userContext.userid] && Object.keys(obj[userContext.userid]).length > 0;
  };

  return (
    <SearchContext.Provider
      value={{
        qtext,
        entityType,
        facetStrings,
        start,
        pageLength,
        searchResults,
        returned,
        total,
        recentSearches,
        loading,
        queryString,
        pageNumber,
        sortOrder,
        setPageNumber,
        handleSearch,
        handleFacetString,
        handleFacetDateRange,
        handlePagination,
        handleQueryFromParam,
        handleGetSearchLocal,
        handleDeleteAllRecent,
        hasSavedRecords,
        handleSort,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;