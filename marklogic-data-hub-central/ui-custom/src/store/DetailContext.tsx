import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../store/UserContext";
import { getDetail } from "../api/api";

interface DetailContextInterface {
  detail: any;
  handleDetail: any;
}
  
const defaultState = {
  detail: {},
  handleDetail: () => {}
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

  const [detailId, setDetailId] = useState<string>("");
  const [detail, setDetail] = useState<any>({});
  const [newDetail, setNewDetail] = useState<boolean>(false);

  // TODO determine if useEffect is needed like in searchContext
  useEffect(() => {
    if (newDetail) {
      setNewDetail(false);
      let newQuery = {
          "searchText": "",
          "entityTypeIds": ["person"],
          "selectedFacets": {
              "personId": [detailId]
          }
      }
      let sr = getDetail(newQuery, userContext.userid);
      sr.then(result => {
        setDetail(result?.data.searchResults.response);
        setNewDetail(false);
      }).catch(error => {
        console.error(error);
      })
    }
  }, [newDetail]);

  const handleDetail = (id) => {
    console.log("handleDetail", id);
    setDetailId(id);
    // TODO using search results endpoint for now filtered by ID
    let newQuery = {
        "searchText": "",
        "entityTypeIds": ["person"],
        "selectedFacets": {
            "personId": [id]
        }
    }
    let sr = getDetail(newQuery, userContext.userid);
    sr.then(result => {
      setDetail(result?.data.searchResults.response);
      if (location.pathname !== "/detail/" + id) {
        navigate("/detail/" + id); // Detail click from another view
      }
      // setNewDetail(false);
    }).catch(error => {
      console.error(error);
    })
    // setNewDetail(true);
  };

  return (
    <DetailContext.Provider
      value={{
        detail,
        handleDetail
      }}
    >
      {children}
    </DetailContext.Provider>
  );
};

export default DetailProvider;