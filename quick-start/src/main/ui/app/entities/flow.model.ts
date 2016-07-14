import { Plugin } from './plugin.model';

export class Flow {
  entityName: string;
  flowName: string;
  pluginFormat: string;
  dataFormat: string;
  plugins: Array<Plugin>;

  constructor() {}
}
