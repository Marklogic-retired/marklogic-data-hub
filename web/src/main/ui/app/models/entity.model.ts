import { InfoType } from './info.model';
import { DefinitionType } from './definition.model';
import { DefinitionsType } from './definitions.model';
import { HubUIData } from './hubuidata.model';
import { Point } from '../components/entity-modeler/math-helper';
import { Flow } from './flow.model';
import * as _ from 'lodash';

export class Entity {
  filename: string;
  hubUi: HubUIData;

  info: InfoType;
  definition: DefinitionType;
  definitions: DefinitionsType;

  inputFlows: Array<Flow>;
  harmonizeFlows: Array<Flow>;

  ///////////////////////////////////
  // ephemeral data

  // holds a copy of the original, untouched values
  // used for editing entities in the UI so that we can undo changes
  original: string;

  lastX: number;
  lastY: number;
  private _scale: number = 1;

  set scale(s: number) {
    this._scale = s;
    this.updateTransform();
  }
  get scale(): number {
    return this._scale;
  }

  editDescription: boolean = false;
  editBaseUri: boolean = false;
  editing: boolean = false;
  hasDocs: boolean = false;

  dragging: boolean = false;
  transform: string = 'translate(0, 0)';

  // end ephemeral data
  ///////////////////////////////////

  get name(): string {
    return this.info.title;
  }

  set name(name: string) {
    this.info.title = name;
  }

  get x(): number {
    return this.hubUi.x || 0;
  }

  set x(newX: number) {
    this.hubUi.x = newX;
    this.updateTransform();
  }

  get y(): number {
    return this.hubUi.y || 0;
  }

  set y(newY: number) {
    this.hubUi.y = newY;
    this.updateTransform();
  }

  get pos(): Point {
    return new Point(this.x, this.y);
  }

  get hasFlows(): boolean {
    return (this.inputFlows.length > 0 || this.harmonizeFlows.length > 0);
  }

  get inputFlowCount(): number {
    return this.inputFlows.length;
  }

  get harmonizeFlowCount(): number {
    return this.harmonizeFlows.length;
  }

  private updateTransform() {
    this.transform = `translate(${this.x}, ${this.y}) scale(${this.scale})`;
  }

  set definitionsType(_definitions: DefinitionsType) {
    this.definitions = _definitions;
  }

  constructor() {}

  fromJSON(json) {
    this.filename = json.filename;
    if (json && json.hubUi) {
      this.hubUi = new HubUIData().fromJSON(json.hubUi);
      this.updateTransform();
    }

    if (json.info) {
      this.info = new InfoType().fromJSON(json.info);
    }

    if (json.definition) {
      this.definition = new DefinitionType().fromJSON(json.definition);
    }

    if (json.definitions) {
      this.definitions = new DefinitionsType().fromJSON(json.definitions);
      if (!json.definition) {
        this.definition = this.definitions.get(this.name);
      }
    }

    this.inputFlows = [];
    if (json.inputFlows && _.isArray(json.inputFlows)) {
      for (let flow of json.inputFlows) {
        this.inputFlows.push(new Flow().fromJSON(flow));
      }
    }

    this.harmonizeFlows = [];
    if (json.harmonizeFlows && _.isArray(json.harmonizeFlows)) {
      for (let flow of json.harmonizeFlows) {
        this.harmonizeFlows.push(new Flow().fromJSON(flow));
      }
    }


    return this;
  }

  defaultValues(): Entity {
    this.fromJSON({
      'definition': {
        'description': null,
        'name': null,
        'primaryKey': null,
        'properties': [],
        'elementRangeIndex': [],
        'rangeIndex': [],
        'required': [],
        'wordLexicon': [],
        'pii': []
      },
      'filename': null,
      'hubUi': {
        x: 10,
        y: 115,
        width: 350,
        height: 100
      },
      'info': {
        'baseUri': null,
        'description': null,
        'title': null,
        'version': '0.0.1'
      }
    });
    return this;
  }
}
