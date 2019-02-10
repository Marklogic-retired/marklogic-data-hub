import { Plugin } from './plugin.model';

export class Flow {
  entityName: string;
  flowName: string;
  codeFormat: string;
  dataFormat: string;
  useEsModel: boolean = true;
  mappingName: string;
  plugins: Array<Plugin>;
  tabIndex = 0;

  constructor() {}

  transformModulePath(){
    if(this.codeFormat.toLowerCase() === 'javascript') {
      return '/data-hub/4/transforms/mlcp-flow-transform.sjs'
    } else {
      return '/data-hub/4/transforms/mlcp-flow-transform.xqy';
    }
  }

  fromJSON(json) {
    this.entityName = json.entityName;
    this.flowName = json.flowName;
    this.codeFormat = json.codeFormat;
    this.dataFormat = json.dataFormat;
    this.mappingName = json.mapping;
    this.plugins = [];
    if (json.plugins) {
      for (let plugin of json.plugins) {
        this.plugins.push(new Plugin().fromJSON(plugin));
      }
    }
    return this;
  }
}
