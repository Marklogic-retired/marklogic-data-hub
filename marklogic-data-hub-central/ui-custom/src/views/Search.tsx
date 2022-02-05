import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../store/UserContext";
import SummaryMeter from "../components/SummaryMeter/SummaryMeter";
import Facets from "../components/Facets/Facets";
import SelectedFacets from "../components/SelectedFacets/SelectedFacets";
import ResultsList from "../components/ResultsList/ResultsList";
import "./Search.scss";

type Props = {};

const Search: React.FC<Props> = (props) => {

  const userContext = useContext(UserContext);

  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    setConfig(userContext.config);
  }, []);

  return (
    <div className="search">
      <aside>

        {config?.search.meter ? 
          <SummaryMeter config={config.search.meter} />
        : null}

        {config?.search.facets ? 
          <Facets config={config.search.facets} />
        : null}

      </aside>
      <div className="results">

        {config?.search ? // TODO pass config into SelectedFacets
          <SelectedFacets />
        : null}

        {config?.search.results ? 
          <ResultsList config={config.search.results} />
        : null}

      </div>
    </div>
  );
};

export default Search;
