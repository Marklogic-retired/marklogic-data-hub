import { PropertyType } from './property.model';

export class DefinitionType {
  description: string;
  primaryKey: string;
  required: Array<string>;
  elementRangeIndex: Array<string>;
  rangeIndex: Array<string>;
  wordLexicon: Array<string>;
  pii: Array<string>;
  properties: Array<PropertyType>;

  fromJSON(json: any) {
    this.description = json.description;
    this.primaryKey = json.primaryKey;
    this.required = json.required;
    this.elementRangeIndex = json.elementRangeIndex;
    this.rangeIndex = json.rangeIndex;
    this.wordLexicon = json.wordLexicon;
    this.pii = json.pii;
    this.properties = new Array<PropertyType>();

    for (let property of json.properties) {
      this.properties.push(new PropertyType().fromJSON(property));
    }
    return this;
  }
}
