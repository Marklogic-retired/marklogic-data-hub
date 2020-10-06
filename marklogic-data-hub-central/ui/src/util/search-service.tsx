import axios from 'axios';

const getResultsByQuery = async (database: string, ctsQuery: string, count: number, urisOnly: boolean) => {
    let data = {
      database: database,
      sourceQuery: ctsQuery,
      count: count,
      urisOnly: urisOnly
    };

    let resp = await axios.post(`/api/map-search/sjsSearch`, data);
    return resp;
  };

const getDoc = async (database: string, docUri: string) => {
    let resp = await axios.get(`/api/map-search/doc?database=${database}&docUri=${encodeURIComponent(docUri)}`);
    return resp;
  };

export {
    getResultsByQuery,
    getDoc
};