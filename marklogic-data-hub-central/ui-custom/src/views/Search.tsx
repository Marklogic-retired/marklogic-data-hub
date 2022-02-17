import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../store/UserContext";
import { SearchContext } from "../store/SearchContext";
import Loading from "../components/Loading/Loading";
import SummaryMeter from "../components/SummaryMeter/SummaryMeter";
import Facets from "../components/Facets/Facets";
import SelectedFacets from "../components/SelectedFacets/SelectedFacets";
import ResultsList from "../components/ResultsList/ResultsList";
import "./Search.scss";
import _ from "lodash";

type Props = {};

const Search: React.FC<Props> = (props) => {

  const userContext = useContext(UserContext);
  const searchContext = useContext(SearchContext);

  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    setConfig(userContext.config);
    // If config is loaded but searchResults context is empty, 
    // load searchResults context so content is displayed
    if (userContext.config.search && _.isEmpty(searchContext.searchResults)) {
      searchContext.handleSearch();
    }
  }, [userContext.config]);

  return (
    <div className="search">

      {config?.search ? 
      
      <>

        <aside>

          {config?.search?.meter ? 
            <SummaryMeter config={config.search.meter} />
          : null}

          {config?.search?.facets ? 
            <Facets config={config.search.facets} />
          : null}

        </aside>
        <div className="results">

          {config?.search ? // TODO pass config into SelectedFacets
            <SelectedFacets />
          : null}

          {config?.search?.results ? 
            <ResultsList config={config.search.results} />
          : null}

        </div>

      </>

      : <Loading />}

    </div>
  );
};

export default Search;
