import React, {useState, useContext} from 'react';
import {useNavigate, useLocation} from "react-router-dom";
import {UserContext} from "../store/UserContext";
import {getRecent, saveRecent, getRecords} from "../api/api";
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
  handleDeleteAllRecent: any;
  hasSavedRecords: any;
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
  handleExpandIds: (idsObject = EXPANDIDS) => { },
  handleDeleteAllRecent: () => {},
  hasSavedRecords: () => {}
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

  // TODO remove when URI-based detail view is definite
  const buildQuery = (id): QueryInterface => {
    let query = {
      "searchText": "",
      "entityTypeIds": [userContext.config.api.detailType] as any,
      "selectedFacets": {}
    }
    query["selectedFacets"][userContext.config.api.detailConstraint] = [id];
    return query;
  };

  const handleExpandIds = (idsObject) => {
    setExpandIds(idsObject)
  }

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
    else {
      setRecentRecords([]);
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

  const handleSaveRecentLocal = async () => {
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
      let obj;
      if (newObj && newObj[userContext.userid]) {
        obj = newObj[userContext.userid];
        newObj[userContext.userid][detailUri] = dt;
      } else {
        newObj[userContext.userid] = {};
        newObj[userContext.userid][detailUri] = dt;
      }
      localStorage.setItem("recent", JSON.stringify(newObj));
      //To handle deletion of records in local storage when over certain count and time limit
      if(obj) {
        await handleDeleteRecentByMaxEntries(obj);
        await handleDeleteRecentByMaxTime(obj);
        localStorage.setItem("recent", JSON.stringify(newObj));
      }
    }
  };

  const handleDeleteRecentByMaxEntries = (obj) => {
    let maxEntries = userContext.config.dashboard.recentRecords.config.maxEntries;
    if (Object.keys(obj).length > maxEntries)
      delete obj[Object.keys(obj)[0]];
  }

  const handleDeleteRecentByMaxTime = (obj) => {
    let maxTimes = userContext.config.dashboard.recentRecords.config.maxTime;
    let curr = new Date();
    for(let i=0;i<Object.keys(obj).length;i++) {
      let itemStorageTime = new Date(obj[Object.keys(obj)[i]]);
      let diffMilliSeconds = curr.getTime() - itemStorageTime.getTime();
      let diffMinutes = diffMilliSeconds/60000;
      if(diffMinutes > maxTimes) {
        delete obj[Object.keys(obj)[i]];
        i--;
      }
    }
  }

  const handleDeleteAllRecent = () => {
    localStorage.removeItem("recent");
    handleGetRecentLocal();
  }

  const hasSavedRecords = () => {
    let json = localStorage.getItem("recent");
    let obj = json ? JSON.parse(json) : null;
    return obj && obj[userContext.userid] && Object.keys(obj[userContext.userid]).length > 0;
  }

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
        handleExpandIds,
        handleDeleteAllRecent,
        hasSavedRecords
      }}
    >
      {children}
    </DetailContext.Provider>
  );
};

export default DetailProvider;