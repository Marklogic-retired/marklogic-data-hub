import axios from "axios";

export const createStep = async (name, type, settings) => {
    return await axios.post(`/api/steps/${type}/${name}`, settings);
}

export const getStep = async (name, type) => {
    return await axios.get(`/api/steps/${type}/${name}`);
}

export const getSteps = async (type) => {
    return await axios.get(`/api/steps/${type}`);
}

export const deleteStep = async (name, type) => {
    return await axios.delete(`/api/steps/${type}/${name}`);
}
