import React from 'react';

interface IRolesContextInterface {
    roles: string[];
    setRoles: (roles: string[]) => void;
    canReadMappings: () => boolean;
    canWriteMappings: () => boolean;
    canReadLoadData: () => boolean;
    canWriteLoadData: () => boolean;
    canReadEntityModels: () => boolean;
    canWriteEntityModels: () => boolean;
    canReadFlows: () => boolean;
    canWriteFlows: () => boolean;
    canReadStepDefinitions: () => boolean;
    canWriteStepDefinitions: () => boolean;
    hasOperatorRole: () => boolean;
}

/**
 *  Roles Service that has roles read in at login
 *
 * @description This service provides information about what capabilities the user has.
 */
export class RolesService implements IRolesContextInterface {
    public roles: string[] = [];

    public setRoles: (roles: string[]) => void = (roles: string[]) => {
        this.roles = roles;
    };

    public canReadMappings:() => boolean = () => {
        return this.roles.includes('data-hub-mapping-reader');
    };
    public canWriteMappings:() => boolean = () => {
        return this.roles.includes('data-hub-mapping-writer');
    };
    public canReadLoadData:() => boolean = () => {
        return this.roles.includes('data-hub-load-data-reader');
    };
    public canWriteLoadData:() => boolean = () => {
        return this.roles.includes('data-hub-load-data-writer');
    };
    public canReadEntityModels:() => boolean = () => {
        return this.roles.includes('data-hub-entity-model-reader');
    };
    public canWriteEntityModels:() => boolean = () => {
        return this.roles.includes('data-hub-entity-model-writer');
    };
    public canReadFlows:() => boolean = () => {
        return this.roles.includes('data-hub-flow-reader');
    };
    public canWriteFlows:() => boolean = () => {
        return this.roles.includes('data-hub-flow-writer');
    };
    public canReadStepDefinitions:() => boolean = () => {
        return this.roles.includes('data-hub-step-definition-reader');
    };
    public canWriteStepDefinitions:() => boolean = () => {
        return this.roles.includes('data-hub-step-definition-writer');
    };
    public hasOperatorRole:() => boolean = () => {
        return this.roles.includes('data-hub-operator');
    };
}

export const RolesContext = React.createContext<IRolesContextInterface>(new RolesService());

