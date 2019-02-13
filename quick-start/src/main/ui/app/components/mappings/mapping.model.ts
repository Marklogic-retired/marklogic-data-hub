import * as _ from 'lodash';
import {isNumber} from "util";

export class Mapping {

  public name: string;
  public sourceContext: string;
  public targetEntityType: string;
  public description: string;
  public sourceURI: string;
  public language: string;
  public version: number = 0;
  public properties: object = {};


  constructor() {}

  fromJSON(json) {
    if(json.name) {
      this.name = json.name;
    }
    if(json.sourceContext) {
      this.sourceContext = json.sourceContext;
    }
    if(json.targetEntityType) {
      this.targetEntityType = json.targetEntityType;
    }
    if(json.description) {
      this.description = json.description;
    }
    if(json.sourceURI) {
      this.sourceURI = json.sourceURI;
    }
    if(json.version && isNumber(parseInt(json.version))){
      this.version = json.version;
    }
    if(json.properties) {
      this.properties = json.properties;
    }

    return this;
  }

}
