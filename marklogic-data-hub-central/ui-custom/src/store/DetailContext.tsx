import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../store/UserContext";
import { getRecentlyVisited, saveRecentlyVisited, getRecord } from "../api/api";

interface DetailContextInterface {
  detail: any;
  recent: any;
  handleGetDetail: any;
  handleGetRecentlyVisited: any;
  handleSaveRecentlyVisited: any;
}
interface QueryInterface {
  searchText: string;
  entityTypeIds: string[];
  selectedFacets: any;
}
  
const defaultState = {
  detail: {},
  recent: [],
  handleGetDetail: () => {},
  handleGetRecentlyVisited: () => {},
  handleSaveRecentlyVisited: () => {}
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
  const [newDetail, setNewDetail] = useState<boolean>(false);

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
    let sr = getRecord(uri, userContext.userid);
    sr.then(result => {
      setDetail(result?.data);
      if (location.pathname !== "/detail/" + encodeURIComponent(uri)) {
        navigate("/detail/" + encodeURIComponent(uri)); // Detail click from another view
      }
      handleGetRecentlyVisited();
    }).catch(error => {
      console.error(error);
    })
  };

  const handleGetRecentlyVisited = () => {
    let sr = getRecentlyVisited(userContext.userid);
    sr.then(result => {
      setRecent(result?.data);
    }).catch(error => {
      console.error(error);
    })
  };

  const handleSaveRecentlyVisited = () => {
    let sr = saveRecentlyVisited(detailUri, userContext.userid);
    sr.then(result => {
      console.log("handleSaveRecentlyVisited", detailUri)
    }).catch(error => {
      console.error(error);
    })
  };

  return (
    <DetailContext.Provider
      value={{
        detail,
        recent,
        handleGetDetail,
        handleGetRecentlyVisited,
        handleSaveRecentlyVisited
      }}
    >
      {children}
    </DetailContext.Provider>
  );
};

export default DetailProvider;