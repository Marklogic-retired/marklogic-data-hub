import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../store/UserContext";
import { getSearchResults } from "../api/api";
import _ from "lodash";

interface SearchContextInterface {
  qtext: string;
  entityType: any;
  facetStrings: string[];
  searchResults: any;
  returned: number;
  total: number;
  recentSearches: any;
  loading: boolean;
  handleSearch: any;
  handleFacetString: any;
  handleSaved: any;
  handleGetSearchLocal: any;
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
  returned: 0,
  total: 0,
  recentSearches: [],
  loading: false,
  handleSearch: () => {},
  handleFacetString: () => {},
  handleSaved: () => {},
  handleGetSearchLocal: () => {}
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
 * @prop {HandleSaved} handleSaved - Callback to execute a search via selection of a saved query (TODO document interface). 
 * @example
 * TBD
 */
export const SearchContext = React.createContext<SearchContextInterface>(defaultState);

const SearchProvider: React.FC = ({ children }) => {

  const userContext = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();

  const startInit = 1;
  const pageLengthInit = 100;

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

  const buildQuery = (start, pageLength, _qtext, _facetStrings, _entityType):QueryInterface => {
    let query = {
      searchText: _qtext,
      entityTypeIds: Array.isArray(_entityType) ? _entityType : [_entityType],
      selectedFacets: {}
    };
    if (facetStrings && facetStrings.length > 0) {
      facetStrings.forEach(fs => {
        let parts = fs.split(":");
        if (query.selectedFacets[parts[0]]) {
          query.selectedFacets[parts[0]].push(parts[1]);
        } else {
          query.selectedFacets[parts[0]] = [parts[1]];
        }
      });
    }
    return query;
  };

  useEffect(() => {
    if (newSearch) {
      setNewSearch(false);
      setLoading(true);
      if (location.pathname !== "/search") {
        navigate("/search"); // Handle search submit from another view
      }
      let newQuery = buildQuery(startInit, pageLengthInit, qtext, facetStrings, entityType);
      let sr = getSearchResults(userContext.config.api.searchResultsEndpoint, newQuery, userContext.userid);
      sr.then(result => {
        setSearchResults(result?.data.searchResults.response);
        setReturned(result?.data.searchResults.response.total);
        // TODO need total records in database in result
        setTotal(userContext.config.search.meter.totalRecords);
        handleSaveSearchLocal();
        handleGetSearchLocal();
        setNewSearch(false);
        setLoading(false);
      }).catch(error => {
        console.error(error);
      })
    }
  }, [newSearch]);

  const handleSearch = async (_qtext=null, _entityType=null) => {
    if (_qtext!==null) {
      setQtext(_qtext);
    }
    if (_entityType!==null) {
      setEntityType(_entityType);
    } else {
      // If entityType hasn't been set, use search.defaultEntity if available
      setEntityType(userContext.config.search.defaultEntity || "");
    }
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
    setNewSearch(true);
  };

  const handleSaved = (opts) => {
    setQtext(opts.qtext);
    setFacetStrings(opts.facetStrings);
    if (location.pathname !== "/search") {
      navigate("/search"); // Handle search submit from another view
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
        return JSON.parse(q);
      })
    }
    if (sortedQueries.length > 0) {
      setLoading(true);
      setRecentSearches(sortedQueries);
      setLoading(false);
    }
  };

  const buildSavedSearch = (qtext, facetStrings) => {
    const obj = {
      qtext: qtext,
      facetStrings: facetStrings
    }
    return JSON.stringify(obj);
  }

  const handleSaveSearchLocal = () => {
    // Save to local storage
    let json = localStorage.getItem("search");
    let dt = new Date().toISOString();
    let newObj = {};
    if (!qtext && facetStrings.length === 0) return;
    let key = buildSavedSearch(qtext, facetStrings);
    if (!json) {
      newObj[userContext.userid] = {};
      newObj[userContext.userid][key] = dt;
      localStorage.setItem("search", JSON.stringify(newObj));
    } else {
      newObj = JSON.parse(json);
      if (newObj && newObj[userContext.userid]) {
        newObj[userContext.userid][key] = dt;
      } else {
        newObj[userContext.userid] = {};
        newObj[userContext.userid][key] = dt;
      }
      localStorage.setItem("search", JSON.stringify(newObj));
    }
  };

  return (
    <SearchContext.Provider
      value={{
        qtext,
        entityType,
        facetStrings,
        searchResults,
        returned,
        total,
        recentSearches,
        loading,
        handleSearch,
        handleFacetString,
        handleSaved,
        handleGetSearchLocal
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;