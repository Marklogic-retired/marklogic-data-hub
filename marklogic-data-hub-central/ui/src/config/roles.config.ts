import {IRolesContextInterface} from "../util/roles";

// Roles service for data-hub-developer
class DeveloperRolesService implements IRolesContextInterface{
    public roles: string[] = [];

    public setRoles: (roles: string[]) => void = (roles: string[]) => {
        this.roles = roles;
    };
    public canReadMappings:() => boolean = () => {
        return true;
    };
    public canWriteMappings:() => boolean = () => {
        return true;
    };
    public canReadMatchMerge:() => boolean = () => {
        return true;
    };
    public canWriteMatchMerge:() => boolean = () => {
        return true;
    };
    public canReadLoadData:() => boolean = () => {
        return true;
    };
    public canWriteLoadData:() => boolean = () => {
        return true;
    };
    public canReadEntityModels:() => boolean = () => {
        return true;
    };
    public canWriteEntityModels:() => boolean = () => {
        return true;
    };
    public canReadFlows:() => boolean = () => {
        return true;
    };
    public canWriteFlows:() => boolean = () => {
        return true;
    };
    public canReadStepDefinitions:() => boolean = () => {
        return true;
    };
    public canWriteStepDefinitions:() => boolean = () => {
        return true;
    };
    public hasOperatorRole:() => boolean = () => {
        return true;
    };
}

// Roles service for data-hub-operator
class OperatorRolesService implements IRolesContextInterface{
    public roles: string[] = [];

    public setRoles: (roles: string[]) => void = (roles: string[]) => {
        this.roles = roles;
    };
    public canReadMappings:() => boolean = () => {
        return true;
    };
    public canWriteMappings:() => boolean = () => {
        return false;
    };
    public canReadMatchMerge:() => boolean = () => {
        return true;
    };
    public canWriteMatchMerge:() => boolean = () => {
        return false;
    };
    public canReadLoadData:() => boolean = () => {
        return true;
    };
    public canWriteLoadData:() => boolean = () => {
        return false;
    };
    public canReadEntityModels:() => boolean = () => {
        return true;
    };
    public canWriteEntityModels:() => boolean = () => {
        return false;
    };
    public canReadFlows:() => boolean = () => {
        return true;
    };
    public canWriteFlows:() => boolean = () => {
        return false;
    };
    public canReadStepDefinitions:() => boolean = () => {
        return true;
    };
    public canWriteStepDefinitions:() => boolean = () => {
        return false;
    };
    public hasOperatorRole:() => boolean = () => {
        return true;
    };
  }

  const roles = {
    DeveloperRolesService: new DeveloperRolesService(),
    OperatorRolesService: new OperatorRolesService()
};

export default roles;