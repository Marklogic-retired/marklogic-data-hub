import {IAuthoritiesContextInterface} from "../../util/authorities";

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
    public canReadCustom:() => boolean = () => {
        return true;
    };
    public canWriteCustom:() => boolean = () => {
        return true;
    };
    public canDownloadProjectFiles:() => boolean = () => {
        return true;
    };
    public canExportEntityInstances:() => boolean = () => {
        return true;
    };
    public isSavedQueryUser:() => boolean = () => {
        return true;
    };
    public canRunStep:() => boolean = () => {
        return true;
    };
    public canClearUserData:() => boolean = () => {
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
    public canReadCustom:() => boolean = () => {
        return true;
    };
    public canWriteCustom:() => boolean = () => {
        return false;
    };
    public canDownloadProjectFiles:() => boolean = () => {
        return false;
    };
    public canExportEntityInstances:() => boolean = () => {
        return false;
    };
    public isSavedQueryUser:() => boolean = () => {
        return false;
    };
    public canRunStep:() => boolean = () => {
        return true;
    };
    public canClearUserData:() => boolean = () => {
        return false;
    };
  }

  class HCUserRolesService implements IAuthoritiesContextInterface {
    public authorities: string[] = [];

    public setAuthorities: (authorities: string[]) => void = (authorities: string[]) => {
        this.authorities = authorities;
    };
    public canReadMapping:() => boolean = () => {
        return false;
    };
    public canWriteMapping:() => boolean = () => {
        return false;
    };
    public canReadMatchMerge:() => boolean = () => {
        return false;
    };
    public canWriteMatchMerge:() => boolean = () => {
        return false;
    };
    public canReadLoad:() => boolean = () => {
        return false;
    };
    public canWriteLoad:() => boolean = () => {
        return false;
    };
    public canReadEntityModel:() => boolean = () => {
        return false;
    };
    public canWriteEntityModel:() => boolean = () => {
        return false;
    };
    public canReadFlow:() => boolean = () => {
        return false;
    };
    public canWriteFlow:() => boolean = () => {
        return false;
    };
    public canReadCustom:() => boolean = () => {
        return false;
    };
    public canWriteCustom:() => boolean = () => {
        return false;
    };
    public canDownloadProjectFiles:() => boolean = () => {
        return false;
    };
    public canExportEntityInstances:() => boolean = () => {
        return false;
    };
    public isSavedQueryUser:() => boolean = () => {
        return false;
    };
    public canRunStep:() => boolean = () => {
        return false;
    };
    public canClearUserData:() => boolean = () => {
        return false;
    };
  }

  const authorities = {
    DeveloperRolesService: new DeveloperRolesService(),
    OperatorRolesService: new OperatorRolesService(),
    HCUserRolesService: new HCUserRolesService()
};

export default authorities;
