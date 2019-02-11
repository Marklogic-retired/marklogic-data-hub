import {CodemirrorComponent} from '../components/codemirror';

export class Plugin {
  $dirty: boolean;
  hasShown: boolean = false;
  pluginType: string;
  pluginPath: string;
  fileContents: string;
  codemirrorConfig: any;
  cm: CodemirrorComponent;
  history: any = {
    done: [],
    undone: []
  }

  constructor() {
  }

  fromJSON(json) {
    this.pluginType = json.pluginType;
    this.pluginPath = json.pluginPath;
    this.fileContents = json.fileContents;
    return this;
  }
}
