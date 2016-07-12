import { Flow } from './flow.model';

export class Entity {
  entityName: string;
  inputFlows: Array<Flow>;
  harmonizeFlows: Array<Flow>;

  pluginFormat: string;
  dataFormat: string;

  constructor() {}
}
