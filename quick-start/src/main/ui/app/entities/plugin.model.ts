export class Plugin {
  $dirty: boolean;
  pluginType: string;
  pluginPath: string;
  files: Object;

  constructor() {}

  fromJSON(json) {
    this.pluginType = json.pluginType;
    this.pluginPath = json.pluginPath;
    this.files = json.files;
    return this;
  }
}
