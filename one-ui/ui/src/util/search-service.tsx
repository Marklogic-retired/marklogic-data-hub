import axios from 'axios'

const getResultsByQuery = async (database: string, ctsQuery: string, count: number, urisOnly: boolean) => {
    let data = {
      database: database,
      sourceQuery: ctsQuery,
      count: count,
      urisOnly: urisOnly
    }

    //let resp = await axios.post(`/api/search/sjsSearch`, data);
    let resp = await axios.post(`/api/sjsSearch`, data);
    console.log('search API Called', resp)
    return resp;
  }

const getDoc = async (database: string, docUri: string) => {
    //let resp = await axios.get(`/api/search/doc?database=${database}&docUri=${encodeURIComponent(docUri)}`);
    let resp = await axios.get(`/api/doc?database=${database}&docUri=${encodeURIComponent(docUri)}`);
    return resp;
  }

export {
    getResultsByQuery,
    getDoc
}