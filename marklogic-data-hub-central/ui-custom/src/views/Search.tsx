import React, { useState, useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { UserContext } from "../store/UserContext";
import { SearchContext } from "../store/SearchContext";
import Loading from "../components/Loading/Loading";
import SummaryMeter from "../components/SummaryMeter/SummaryMeter";
import Facets from "../components/Facets/Facets";
import SelectedFacets from "../components/SelectedFacets/SelectedFacets";
import ResultsList from "../components/ResultsList/ResultsList";
import { Col, Row, Container } from "react-bootstrap";
// import "./Search.scss";
import _ from "lodash";

type Props = {};

const COMPONENTS = {
  Facets: Facets,
  ResultsList: ResultsList,
  SelectedFacets: SelectedFacets,
  SummaryMeter: SummaryMeter
};

const Search: React.FC<Props> = (props) => {

  const userContext = useContext(UserContext);
  const searchContext = useContext(SearchContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const [config, setConfig] = useState<any>(null);
  const [checkQuery, setCheckQuery] = useState<boolean>(false);

  const queryFromParam = searchParams.get('query');

  useEffect(() => {
    setConfig(userContext.config);
    if (!_.isEmpty(userContext.config)) {
      // After config is loaded, check loading query from URL param
      setCheckQuery(true);
    }
  }, [userContext.config]);

  useEffect(() => {
    if (checkQuery) {
      if (queryFromParam) {
        if (searchContext.queryString === "") {
          // New page load so search with query from URL param
          searchContext.handleQueryFromParam(JSON.parse(decodeURI(queryFromParam)));
        }
      }
      setCheckQuery(false);
    }
  }, [checkQuery]);

  return (
    <Container fluid>
      <Row className="search">
        {config?.search ?
          (<>
            <Col md={4} lg={3} xl={2} className="sidebar sidebar-sticky">
              {config?.search?.meter &&
                React.createElement(
                  COMPONENTS[config.search.meter.component],
                  { config: config.search.meter.config }, null
                )}

              {config?.search?.facets &&
                React.createElement(
                  COMPONENTS[config.search.facets.component],
                  { config: config.search.facets.config }, null
                )}
           
            </Col>
            <Col md={8} lg={9} xl={10} className="offset-xl-2 offset-lg-3 offset-md-4 results p-4">
              {config?.search?.selectedFacets &&
                React.createElement(
                  COMPONENTS[config.search.selectedFacets.component],
                  { config: config.search.selectedFacets.config }, null
                )}

              {config?.search?.results && !searchContext.loading ?
                React.createElement(
                  COMPONENTS[config.search.results.component],
                  { config: config.search.results.config }, null
                ) : <Loading />}

            </Col>
          </>) : <Loading />
        }

      </Row>
    </Container>
  );
};

export default Search;
