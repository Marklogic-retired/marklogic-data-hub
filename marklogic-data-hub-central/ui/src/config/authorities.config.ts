import {IAuthoritiesContextInterface} from "../util/authorities";

// Roles service for data-hub-developer
class DeveloperRolesService implements IAuthoritiesContextInterface{
    public authorities: string[] = [];

    public setAuthorities: (authorities: string[]) => void = (authorities: string[]) => {
        this.authorities = authorities;
    };
    public canReadMapping:() => boolean = () => {
        return true;
    };
    public canWriteMapping:() => boolean = () => {
        return true;
    };
    public canReadMatchMerge:() => boolean = () => {
        return true;
    };
    public canWriteMatchMerge:() => boolean = () => {
        return true;
    };
    public canReadLoad:() => boolean = () => {
        return true;
    };
    public canWriteLoad:() => boolean = () => {
        return true;
    };
    public canReadEntityModel:() => boolean = () => {
        return true;
    };
    public canWriteEntityModel:() => boolean = () => {
        return true;
    };
    public canReadFlow:() => boolean = () => {
        return true;
    };
    public canWriteFlow:() => boolean = () => {
        return true;
    };
    public canReadStepDefinition:() => boolean = () => {
        return true;
    };
    public canWriteStepDefinition:() => boolean = () => {
        return true;
    };
    public canExportEntityInstances:() => boolean = () => {
        return true;
    };
    public isSavedQueryUser:() => boolean = () => {
        return true;
    };
    public hasOperatorRole:() => boolean = () => {
        return true;
    };
}

// Roles service for data-hub-operator
class OperatorRolesService implements IAuthoritiesContextInterface{
    public authorities: string[] = [];

    public setAuthorities: (authorities: string[]) => void = (authorities: string[]) => {
        this.authorities = authorities;
    };
    public canReadMapping:() => boolean = () => {
        return true;
    };
    public canWriteMapping:() => boolean = () => {
        return false;
    };
    public canReadMatchMerge:() => boolean = () => {
        return true;
    };
    public canWriteMatchMerge:() => boolean = () => {
        return false;
    };
    public canReadLoad:() => boolean = () => {
        return true;
    };
    public canWriteLoad:() => boolean = () => {
        return false;
    };
    public canReadEntityModel:() => boolean = () => {
        return true;
    };
    public canWriteEntityModel:() => boolean = () => {
        return false;
    };
    public canReadFlow:() => boolean = () => {
        return true;
    };
    public canWriteFlow:() => boolean = () => {
        return false;
    };
    public canReadStepDefinition:() => boolean = () => {
        return true;
    };
    public canWriteStepDefinition:() => boolean = () => {
        return false;
    };
    public canExportEntityInstances:() => boolean = () => {
        return false;
    };
    public isSavedQueryUser:() => boolean = () => {
        return false;
    };
    public hasOperatorRole:() => boolean = () => {
        return true;
    };
  }

  const authorities = {
    DeveloperRolesService: new DeveloperRolesService(),
    OperatorRolesService: new OperatorRolesService()
};

export default authorities;