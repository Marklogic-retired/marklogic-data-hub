import { CodemirrorComponent } from '../codemirror';

export class Plugin {
  $dirty: boolean;
  hasShown: boolean = false;
  pluginType: string;
  pluginPath: string;
  files: Object;
  codemirrorConfig: any;
  cm: CodemirrorComponent;
  history: any = {
    done: [],
    undone: []
  }

  constructor() {}

  fromJSON(json) {
    this.pluginType = json.pluginType;
    this.pluginPath = json.pluginPath;
    this.files = json.files;
    return this;
  }
}
