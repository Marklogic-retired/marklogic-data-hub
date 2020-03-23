import axios from 'axios'

const getMappingValidationResp = async (mapName: string, map, uri:string, dbName:string) => {
    console.log(`POST /api/artifacts/mapping/validation`);
    let resp = await axios.post(`/api/artifacts/mapping/validation?uri=${uri}&db=${dbName}`, map);
    return resp;
}

const getSettingsArtifact = async (activityType,artifactName) => {
    console.log(`GET /api/artifacts/${activityType}/${artifactName}/settings`);
    let response = await axios.get(`/api/artifacts/${activityType}/${artifactName}/settings`);
    return response;
}

export {
    getMappingValidationResp,
    getSettingsArtifact
}