import { PropertyType } from './property.model';

export class DefinitionType {
  description: string;
  primaryKey: string;
  required: Array<string>;
  rangeIndex: Array<string>;
  wordLexicon: Array<string>;
  properties: Array<PropertyType>;

  fromJSON(json: any) {
    this.description = json.description;
    this.primaryKey = json.primaryKey;
    this.required = json.required;
    this.rangeIndex = json.rangeIndex;
    this.wordLexicon = json.wordLexicon;
    this.properties = new Array<PropertyType>();

    for (let property of json.properties) {
      this.properties.push(new PropertyType().fromJSON(property));
    }
    return this;
  }
}
