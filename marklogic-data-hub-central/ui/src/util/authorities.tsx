import React from 'react';

export interface IAuthoritiesContextInterface {
    authorities: string[];
    setAuthorities: (authorities: string[]) => void;
    canReadMapping: () => boolean;
    canWriteMapping: () => boolean;
    canReadMatchMerge: () => boolean;
    canWriteMatchMerge: () => boolean;
    canReadLoadData: () => boolean;
    canWriteLoadData: () => boolean;
    canReadEntityModel: () => boolean;
    canWriteEntityModel: () => boolean;
    canReadFlow: () => boolean;
    canWriteFlow: () => boolean;
    canReadStepDefinition: () => boolean;
    canWriteStepDefinition: () => boolean;
    canExportEntityInstances: () => boolean;
    hasOperatorRole: () => boolean;
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
        // As of the moment readMatch and readMerge are connected
        return this.authorities.includes('readMatch');
    };
    public canWriteMatchMerge:() => boolean = () => {
        // As of the moment writeMatch and writeMerge are connected
        return this.authorities.includes('writeMatch');
    };
    public canReadLoadData:() => boolean = () => {
        return this.authorities.includes('readIngestion');
    };
    public canWriteLoadData:() => boolean = () => {
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
    public canReadStepDefinition:() => boolean = () => {
        return this.authorities.includes('readStepDefinition');
    };
    public canWriteStepDefinition:() => boolean = () => {
        return this.authorities.includes('writeStepDefinition');
    };
    public canExportEntityInstances:() => boolean = () => {
        return this.authorities.includes('exportEntityInstances');
    };
    public hasOperatorRole:() => boolean = () => {
        return this.authorities.includes('operator');
    };
}

export const AuthoritiesContext = React.createContext<IAuthoritiesContextInterface>(new AuthoritiesService());
