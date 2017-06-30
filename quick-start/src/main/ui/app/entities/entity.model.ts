import { Flow } from './flow.model';
import * as _ from 'lodash';

export class Entity {
  entityName: string;
  inputFlows: Array<Flow>;
  harmonizeFlows: Array<Flow>;

  pluginFormat: string;
  dataFormat: string;

  constructor() {}

  public fromJSON(json) {
    this.entityName = json.entityName;
    this.pluginFormat = json.pluginFormat;
    this.dataFormat = json.dataFormat;

    this.inputFlows = [];
    if (json.inputFlows && _.isArray(json.inputFlows)) {
      for (let flow of json.inputFlows) {
        this.inputFlows.push(new Flow().fromJSON(flow));
      }
    }

    this.harmonizeFlows = [];
    if (json.harmonizeFlows && _.isArray(json.harmonizeFlows)) {
      for (let flow of json.harmonizeFlows) {
        this.harmonizeFlows.push(new Flow().fromJSON(flow));
      }
    }

    return this;
  }

}
