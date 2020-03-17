import axios from 'axios'

const getResultsByQuery = async (database: string, ctsQuery: string, count: number, urisOnly: boolean) => {
    let outData: any;
    let data = {
      database: database,
      sourceQuery: ctsQuery,
      count: count,
      urisOnly: urisOnly
    }

    //let resp = await axios.post(`/api/search/sjsSearch`, data);
    let resp = await axios.post(`/api/search/sjsSearch`, data);
    if(resp.status === 200){
      outData = resp.data[0];
    }
    return resp;
  }

const getDoc = async (database: string, docUri: string) => {
    let resp = await axios.get(`/api/search/doc?database=${database}&docUri=${encodeURIComponent(docUri)}`);
    return resp;
  }

export {
    getResultsByQuery,
    getDoc
}