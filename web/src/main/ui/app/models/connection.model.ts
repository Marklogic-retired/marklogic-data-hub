import { Entity } from './entity.model';
import { Point } from '../components/entity-modeler/math-helper';

export class Connection {
  name: string;
  from: Entity;
  fromProperty: string;
  to: Entity;
  type: string;
  d: string;
  arrowTransform: string;
  label: string;
  labelTransform: string;
  start: Point;
  vertices: Array<Point> = [];
  end: Point;

  constructor(config: any) {
    this.from = config.from;
    this.fromProperty = config.fromProperty;
    this.to = config.to;
    this.type = config.type;
    this.name = `${this.from.info.title}-${this.to.info.title}`;
    if (config.vertices) {
      let verts = [];
      for (let vert of config.vertices) {
        verts.push(new Point(vert.x, vert.y));
      }
      this.vertices = verts;
    }

    if (this.type === 'ONE_TO_ONE') {
      this.label = '1..1';
    } else if (this.type === 'ONE_TO_MANY') {
      this.label = '1..∞';
    }
  }
}
