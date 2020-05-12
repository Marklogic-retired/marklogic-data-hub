import axios from 'axios'

const getMappingValidationResp = async (mapName: string, map, uri:string, dbName:string) => {
    console.log(`POST /api/artifacts/mapping/validation`);
    let resp = await axios.post(`/api/artifacts/mapping/validation?uri=${uri}&db=${dbName}`, map);
    return resp;
}

const getSettingsArtifact = async (activityType,artifactName) => {
    console.log(`GET /api/steps/${activityType}/${artifactName}/settings`);
    let response = await axios.get(`/api/steps/${activityType}/${artifactName}/settings`);
    return response;
}

const getNestedEntities = async (entityTypeTitle) => {
    const path = `/api/artifacts/mapping/entity/${entityTypeTitle}`;
    console.log(`GET ${path}`);
    let response = await axios.get(path);
    return response;
}

export {
    getMappingValidationResp,
    getSettingsArtifact,
    getNestedEntities
}
