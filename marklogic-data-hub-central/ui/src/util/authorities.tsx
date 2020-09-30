import React from 'react';

export interface IAuthoritiesContextInterface {
    authorities: string[];
    setAuthorities: (authorities: string[]) => void;
    canReadMapping: () => boolean;
    canWriteMapping: () => boolean;
    canReadMatchMerge: () => boolean;
    canWriteMatchMerge: () => boolean;
    canReadLoad: () => boolean;
    canWriteLoad: () => boolean;
    canReadEntityModel: () => boolean;
    canWriteEntityModel: () => boolean;
    canReadFlow: () => boolean;
    canWriteFlow: () => boolean;
    canReadCustom: () => boolean;
    canWriteCustom: () => boolean;
    canDownloadProjectFiles: () => boolean;
    canExportEntityInstances: () => boolean;
    isSavedQueryUser: () => boolean;
    canRunStep: () => boolean;
    canClearUserData: () => boolean;
}

/**
 *  Authorities Service that has authorities read in at login
 *
 * @description This service provides information about what capabilities the user has.
 */
export class AuthoritiesService implements IAuthoritiesContextInterface {
    public authorities: string[] = [];

    public setAuthorities: (authorities: string[]) => void = (authorities: string[]) => {
        this.authorities = authorities;
    };

    public canReadMapping:() => boolean = () => {
        return this.authorities.includes('readMapping');
    };
    public canWriteMapping:() => boolean = () => {
        return this.authorities.includes('writeMapping');
    };
    public canReadMatchMerge:() => boolean = () => {
        // As of the moment readMatching and readMerging are connected
        return this.authorities.includes('readMatching') && this.authorities.includes('readMerging');
    };
    public canWriteMatchMerge:() => boolean = () => {
        // As of the moment writeMatching and writeMerging are connected
        return this.authorities.includes('writeMatching') && this.authorities.includes('writeMerging');
    };
    public canReadLoad:() => boolean = () => {
        return this.authorities.includes('readIngestion');
    };
    public canWriteLoad:() => boolean = () => {
        return this.authorities.includes('writeIngestion');
    };
    public canReadEntityModel:() => boolean = () => {
        return this.authorities.includes('readEntityModel');
    };
    public canWriteEntityModel:() => boolean = () => {
        return this.authorities.includes('writeEntityModel');
    };
    public canReadFlow:() => boolean = () => {
        return this.authorities.includes('readFlow');
    };
    public canWriteFlow:() => boolean = () => {
        return this.authorities.includes('writeFlow');
    };
    public canReadCustom:() => boolean = () => {
        return this.authorities.includes('readCustom');
    };
    public canWriteCustom:() => boolean = () => {
        return this.authorities.includes('writeCustom');
    };
    public canDownloadProjectFiles:() => boolean = () => {
        return this.authorities.includes('downloadProjectFiles');
    };
    public canExportEntityInstances:() => boolean = () => {
        return this.authorities.includes('exportEntityInstances');
    };
    public canRunStep:() => boolean = () => {
        return this.authorities.includes('runStep');
    };
    public isSavedQueryUser:() => boolean = () => {
        return this.authorities.includes('savedQueryUser');
    };
    public canClearUserData:() => boolean = () => {
        return this.authorities.includes('clearUserData');
    };
}

export const AuthoritiesContext = React.createContext<IAuthoritiesContextInterface>(new AuthoritiesService());
