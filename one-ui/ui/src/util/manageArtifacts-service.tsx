import axios from 'axios'

const getMappingValidationResp = async (mapName: string, map, uri:string, dbName:string) => {
    console.log(`POST /api/artifacts/mapping/${mapName}/validate`);
    let resp = await axios.post(`/api/artifacts/mapping/${mapName}/validate?uri=${uri}&db=${dbName}`, map);
    return resp;
}

export {
    getMappingValidationResp
}