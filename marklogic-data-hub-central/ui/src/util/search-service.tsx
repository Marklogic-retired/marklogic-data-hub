import axios from 'axios';

const getUris = async (stepName: string, count: number) => {
    let resp = await axios.get(`/api/steps/mapping/${stepName}/uris?limit=${count}`);
    return resp;
  };

const getDoc = async (stepName: string, docUri: string) => {
    let resp = await axios.get(`/api/steps/mapping/${stepName}/doc?docUri=${docUri}`);
    return resp;
  };

export {
    getUris,
    getDoc
};
