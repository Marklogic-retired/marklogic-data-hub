import React, {useState, useContext} from 'react';
import {useNavigate, useLocation} from "react-router-dom";
import {UserContext} from "../store/UserContext";
import {getRecent, saveRecent, getRecords, getDetail} from "../api/api";
import _ from "lodash";

interface ExpandIdsInterface {
  membership: boolean;
  info: boolean;
  relationships: boolean;
  imageGallery: boolean;
}

const EXPANDIDS = {
  membership: true,
  info: true,
  relationships: true,
  imageGallery: true
}
interface DetailContextInterface {
  detail: any;
  recentRecords: any;
  loading: boolean;
  expandIds: ExpandIdsInterface;
  handleGetDetail: any;
  handleGetRecent: any;
  handleGetRecentLocal: any;
  handleSaveRecent: any;
  handleSaveRecentLocal: any;
  handleExpandIds: (idsObject: ExpandIdsInterface) => void;
}
interface QueryInterface {
  searchText: string;
  entityTypeIds: string[];
  selectedFacets: any;
}

const defaultState = {
  detail: {},
  recentRecords: [],
  loading: false,
  expandIds: EXPANDIDS,
  handleGetDetail: () => { },
  handleGetRecent: () => { },
  handleGetRecentLocal: () => { },
  handleSaveRecent: () => { },
  handleSaveRecentLocal: () => { },
  handleExpandIds: (idsObject = EXPANDIDS) => { }
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

const DetailProvider: React.FC = ({children}) => {

  const userContext = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [detailUri, setDetailUri] = useState<string>("");
  const [detail, setDetail] = useState<any>({});
  const [recentRecords, setRecentRecords] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandIds, setExpandIds] = useState<ExpandIdsInterface>(EXPANDIDS);

  const handleExpandIds = (idsObject) => {
    setExpandIds(idsObject)
  }

  const handleGetDetail = (uri) => {
    console.log("handleGetDetail", uri);
    setDetailUri(uri);
    setLoading(true);
    let sr = getDetail(userContext.config.api.detailEndpoint, uri, userContext.userid);
    sr.then(result => {
      setDetail(result?.data[0]);
      if (location.pathname !== "/detail?recordId=" + uri) {
        navigate("/detail?recordId=" + uri); // Detail click from another view
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
      setRecentRecords(result?.data);
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
        setRecentRecords(result?.data);
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
        recentRecords,
        loading,
        expandIds,
        handleGetDetail,
        handleGetRecent,
        handleGetRecentLocal,
        handleSaveRecent,
        handleSaveRecentLocal,
        handleExpandIds
      }}
    >
      {children}
    </DetailContext.Provider>
  );
};

export default DetailProvider;