import { DefinitionType } from './definition.model';

export class DefinitionsType  {

  set(definitionName:string, definitionType: DefinitionType) {
    (this as any)[definitionName] = definitionType;
  }

  get(definitionName: string) {
    return (this as any)[definitionName];
  }

  fromJSON(json: any) {
    for (const definitionKey of Object.keys(json)) {
      const definitionType = new DefinitionType();
      definitionType.fromJSON(json[definitionKey]);
      (this as any)[definitionKey] = definitionType;
    }
    return this;
  }
}
