import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../store/UserContext";
import { getRecent, saveRecent, getRecords } from "../api/api";
import _ from "lodash";

interface DetailContextInterface {
  detail: any;
  recent: any;
  loading: boolean;
  handleGetDetail: any;
  handleGetRecent: any;
  handleGetRecentLocal: any;
  handleSaveRecent: any;
  handleSaveRecentLocal: any;
}
interface QueryInterface {
  searchText: string;
  entityTypeIds: string[];
  selectedFacets: any;
}
  
const defaultState = {
  detail: {},
  recent: [],
  loading: false,
  handleGetDetail: () => {},
  handleGetRecent: () => {},
  handleGetRecentLocal: () => {},
  handleSaveRecent: () => {},
  handleSaveRecentLocal: () => {}
};

/**
 * Component for storing detail of a selected record (e.g., from search results).
 * Made available to components that display selected record details.
 *
 * @component
 * @prop {string} detail - Selected record detail.
 * @prop {HandleDetail} handleDetail - Callback to get the record detail (TODO document interface). 
 * @example
 * TBD
 */
export const DetailContext = React.createContext<DetailContextInterface>(defaultState);

const DetailProvider: React.FC = ({ children }) => {

  const userContext = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [detailUri, setDetailUri] = useState<string>("");
  const [detail, setDetail] = useState<any>({});
  const [recent, setRecent] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // TODO remove when URI-based detail view is definite
  const buildQuery = (id):QueryInterface => {
    let query = {
      "searchText": "",
      "entityTypeIds": [userContext.config.api.detailType] as any,
      "selectedFacets": {}
    }
    query["selectedFacets"][userContext.config.api.detailConstraint] = [id];
    return query;
  };

  const handleGetDetail = (uri) => {
    console.log("handleGetDetail", uri);
    setDetailUri(uri);
    setLoading(true);
    let sr = getRecords(userContext.config.api.recordsEndpoint, [uri], userContext.userid);
    sr.then(result => {
      setDetail(result?.data[0]);
      if (location.pathname !== "/detail/" + encodeURIComponent(uri)) {
        navigate("/detail/" + encodeURIComponent(uri)); // Detail click from another view
      }
      setLoading(false);
    }).catch(error => {
      console.error(error);
    })
  };

  const handleGetRecent = () => {
    setLoading(true);
    // Get from database
    let sr = getRecent(userContext.config.api.recentEndpoint, userContext.userid);
    sr.then(result => {
      console.log("recent", result?.data);
      setRecent(result?.data);
      setLoading(false);
    }).catch(error => {
      console.error(error);
    })
  };

  const handleGetRecentLocal = () => {
    // Get from database via URIs in local storage
    let json = localStorage.getItem("recent");
    let obj = json ? JSON.parse(json) : null;
    let sortedObj: any = {}, sortedUris: any = [];
    if (obj && obj[userContext.userid]) {
      sortedObj = _.fromPairs(_.sortBy(_.toPairs(obj[userContext.userid]), 1).reverse());
      sortedUris = Object.keys(sortedObj);
    }
    if (sortedUris.length > 0) {
      setLoading(true);
      let sr = getRecords(userContext.config.api.recordsEndpoint, sortedUris, userContext.userid);
      sr.then(result => {
        setRecent(result?.data);
        setLoading(false);
      }).catch(error => {
        console.error(error);
      })
    }
  };

  const handleSaveRecent = () => {
    // Save to database
    let sr = saveRecent(userContext.config.api.recentEndpoint, detailUri, userContext.userid);
    sr.then(result => {
      console.log("handleSaveRecent", detailUri)
    }).catch(error => {
      console.error(error);
    })
  };

  const handleSaveRecentLocal = () => {
    // Save to local storage
    let json = localStorage.getItem("recent");
    let dt = new Date().toISOString();
    let newObj = {};
    if (!detailUri) return;
    if (!json) {
      newObj[userContext.userid] = {};
      newObj[userContext.userid][detailUri] = dt;
      localStorage.setItem("recent", JSON.stringify(newObj));
    } else {
      newObj = JSON.parse(json);
      if (newObj && newObj[userContext.userid]) {
        newObj[userContext.userid][detailUri] = dt;
      } else {
        newObj[userContext.userid] = {};
        newObj[userContext.userid][detailUri] = dt;
      }
      localStorage.setItem("recent", JSON.stringify(newObj));
    }
  };

  return (
    <DetailContext.Provider
      value={{
        detail,
        recent,
        loading,
        handleGetDetail,
        handleGetRecent,
        handleGetRecentLocal,
        handleSaveRecent,
        handleSaveRecentLocal
      }}
    >
      {children}
    </DetailContext.Provider>
  );
};

export default DetailProvider;