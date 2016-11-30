export class Plugin {
  pluginType: string;
  files: Array<string>;

  constructor() {}

  fromJSON(json) {
    this.pluginType = json.pluginType;
    this.files = [].concat(json.files);
    return this;
  }
}
