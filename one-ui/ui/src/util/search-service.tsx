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
    console.log('search API Called', resp)
    if(resp.status === 200){
      outData = resp.data[0];
    }
    return resp;
  }

const getDoc = async (database: string, docUri: string) => {
  console.log('Hitting the Doc API for ', docUri)
    //let resp = await axios.get(`/api/search/doc?database=${database}&docUri=${encodeURIComponent(docUri)}`);
    let resp = await axios.get(`/api/search/doc?database=${database}&docUri=${encodeURIComponent(docUri)}`);
    console.log('respAtService', resp)
    return resp;
  }

export {
    getResultsByQuery,
    getDoc
}