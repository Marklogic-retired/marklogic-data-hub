import { getQueriesResponse, putQueryResponse, deleteQueryResponse, saveQueryResponse, fetchQueryByResponse } from '../../assets/mock-data/explore/query';

export const fetchQueries = async () => {
    return await new Promise((resolve) => {
        resolve(getQueriesResponse);
    });
};

export const updateQuery = async () => {
    return await new Promise((resolve) => {
        resolve(putQueryResponse);
    });
};

export const removeQuery = async () => {
    return await new Promise((resolve) => {
        resolve(deleteQueryResponse);
    });
};

export const creatNewQuery = async () => {
    return await new Promise((resolve) => {
        resolve(saveQueryResponse);
    });
};

export const fetchQueryById = async () => {
    return await new Promise((resolve) => {
        resolve(fetchQueryByResponse);
    });
};
