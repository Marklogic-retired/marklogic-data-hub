import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';

import { Connection, Entity, PropertyType } from '../../models';

import { EntitiesService } from '../../models/entities.service';

import { InstallService } from '../../services/installer';

import { MdlDialogService, MdlSnackbarService } from '@angular-mdl/core';

import { Point, Line, Rect } from './math-helper';

import * as _ from 'lodash';

@Component({
  selector: 'app-entity-modeler',
  templateUrl: './entity-modeler.component.html',
  styleUrls: ['./entity-modeler.component.scss']
})
export class EntityModelerComponent implements AfterViewChecked {

  @ViewChild('svgRoot') svgRoot: ElementRef;
  private svgRect: Rect;

  public entities: Array<Entity>;
  public entitiesLoaded: boolean = false;
  private connections: Array<Connection> = [];
  private entityMap: Map<string, Entity> = new Map<string, Entity>();
  private draggingEntity: Entity;
  private draggingBox: HTMLElement;
  private selectedEntity: Entity;
  private draggingVertex: Point;
  private _viewScale: number = 1;
  private _inverseScale: number = 1;

  public toolsVisible: boolean = false;

  get viewScale(): number {
    return Math.round(this._viewScale * 100);
  }

  set viewScale(s: number) {
    this._viewScale = _.round((s * 0.01), 2);
    this._inverseScale = 1 / (this._viewScale * (window.outerWidth / window.innerWidth));
    this.entities.forEach((entity: Entity) => {
      entity.scale = this._inverseScale;
    });
  }

  get mainTransform(): string {
    return `scale(${this._viewScale})`;
  }

  getTransform(entity: Entity) {
    entity.scale = 1 / (this._viewScale * window.outerWidth / window.innerWidth);
    return entity.transform;
  }

  @HostListener('mouseup', ['$event']) onMouseup(event: MouseEvent) {
    this.mouseUp();
  }

  @HostListener('mouseleave', ['$event']) onMouseleave(event: MouseEvent) {
    this.mouseUp();
  }

  @HostListener('mousemove', ['$event']) onMousemove(event: MouseEvent) {
    if (this.draggingBox && this.draggingEntity && this.draggingEntity.dragging) {
      let boxWidth = this.draggingBox.clientWidth;
      let boxHeight = this.draggingBox.clientHeight;

      let r = this.svgRoot.nativeElement.getBoundingClientRect();
      let svgWidth = r.width;
      let svgHeight = r.height;

      let rightBounds: number = svgWidth - boxWidth;
      let bottomBounds: number = svgHeight - boxHeight;

      let x = this.draggingEntity.x + (event.clientX - this.draggingEntity.lastX);
      let y = this.draggingEntity.y + (event.clientY - this.draggingEntity.lastY);
      x = Math.max(x, 0);
      y = Math.max(y, 0);

      x = Math.min(x, rightBounds);
      y = Math.min(y, bottomBounds);

      this.draggingEntity.x =  x;
      this.draggingEntity.y = y;

      this.draggingEntity.lastX = event.clientX;
      this.draggingEntity.lastY = event.clientY;

    } else if (this.draggingVertex) {
      let p = this.pointToSvg(event.clientX, event.clientY);
      this.draggingVertex.x = p.x;
      this.draggingVertex.y = p.y;
    }
    this.updateConnections();
  }

  private pointToSvg(x: number, y: number) {
    return new Point(x, y).subtract(this.svgRect.topLeft);
  }

  constructor(
    private dialogService: MdlDialogService,
    private snackbar: MdlSnackbarService,
    private entitiesService: EntitiesService,
    private installService: InstallService) {
    this.getEntities();
  }

  ngAfterViewChecked() {
    if (!this.svgRect && this.svgRoot && this.svgRoot.nativeElement) {
      const svg = this.svgRoot.nativeElement;
      this.svgRect = new Rect(svg.getBoundingClientRect());
    }
  }

  mouseUp = () => {
    if (this.draggingEntity || this.draggingBox || this.draggingVertex) {
      if (this.draggingEntity) {
        this.draggingEntity.dragging = false;
      }
      this.saveUiState();
    }
    setTimeout(() => {
      this.updateConnections();
    }, 0);
    this.draggingEntity = null;
    this.draggingBox = null;
    this.draggingVertex = null;
  };

  getEntities(): void {
    this.entitiesService.entitiesChange.subscribe(entities => {
      this.entitiesLoaded = true;
      this.entities = entities;
      this.entities.forEach((entity: Entity) => {
        this.entityMap.set(entity.name, entity);
      });
      this.buildConnections();
    });
    this.entitiesService.getEntities();
  }

  buildConnections() {
    this.connections = [];

    this.entities.forEach((entity: Entity) => {
      entity.definition.properties.forEach((property: PropertyType) => {
        if (property.isRef) {
          const toEntity = this.entityMap.get(property.refName);
          const conName = `${entity.info.title}-${toEntity.info.title}`;
          this.connections.push(new Connection({
            from: entity,
            fromProperty: property.name,
            to: toEntity,
            type: property.isArray ? 'ONE_TO_MANY' : 'ONE_TO_ONE',
            vertices: entity.hubUi.vertices[conName]
          }));
        }
      });
    });

    setTimeout(() => {
      this.updateConnections();
    }, 500);
  }

  updateConnections() {
    this._inverseScale = 1 / (this._viewScale * (window.outerWidth / window.innerWidth));
    this.connections.forEach((connection: Connection) => {
      if (this.svgRoot) {
        const from = connection.from;
        const to = connection.to;

        const svg = this.svgRoot.nativeElement;

        const fromBox: HTMLElement = svg.querySelector(`#aeb-${from.name}`);
        const fromRect: Rect = new Rect(fromBox.getBoundingClientRect());
        fromRect.offset(this.svgRect.topLeft.negated);
        fromRect.multiply(this._inverseScale);
        let fromCenter: Point = from.pos.add(new Point(fromRect.width / 2, fromRect.height / 2));

        let innerVertices = connection.vertices.map((vertex: Point) => {
          return `${vertex.x} ${vertex.y}`;
        }).join(' ');

        const toBox: HTMLElement = svg.querySelector(`#aeb-${to.name}`);
        const toRect: Rect = new Rect(toBox.getBoundingClientRect());
        toRect.offset(this.svgRect.topLeft.negated);
        toRect.multiply(this._inverseScale);
        let toCenter: Point = to.pos.delta(toRect.halfPoint);

        const vertexCount = connection.vertices.length;

        let nextPoint: Point = (vertexCount > 0) ? connection.vertices[0] : toCenter;

        let startLine: Line = new Line(fromCenter, nextPoint);
        let src: Point = fromRect.getPointOfIntersection(startLine);
        if (!src) {
          src = fromCenter;
        }
        connection.start = src;

        let previousPoint: Point = (vertexCount > 0) ? connection.vertices[vertexCount - 1] : fromCenter;
        let endLine: Line = new Line(previousPoint, toCenter);
        let dst: Point = toRect.getPointOfIntersection(endLine);
        if (!dst) {
          dst = toCenter;
        }
        connection.end = dst;

        connection.d = `M ${src.x} ${src.y} ${innerVertices} ${dst.x} ${dst.y}`;
        let angle = endLine.angle;
        let cardinalityAngle = startLine.angle;
        if (startLine.pointingLeft) {
          cardinalityAngle = cardinalityAngle - 180;
        }
        connection.arrowTransform = `translate(${dst.x},${dst.y}) scale(1) rotate(${angle})`;

        const pathEl: SVGPathElement = svg.querySelector(`#${connection.from.name}-${connection.to.name}`);
        if (pathEl) {
          setTimeout(() => {
            let p: SVGPoint = pathEl.getPointAtLength(25);
            connection.labelTransform = `translate(${p.x},${p.y}) scale(1) rotate(${cardinalityAngle})`;
          }, 0);
        }
      }
    });
  }

  getEntityPosition(index: number): string {
    const x =  index * 300;
    return `translate(${x}, 72) scale(${this._viewScale})`;
  }

  moveEntityToTop(entity: Entity) {
    let idx = _.findIndex(this.entities, entity);
    if (idx >= 0) {
      this.entities.push(this.entities.splice(idx, 1)[0]);
    }
  }

  handleStartDrag(entity: Entity, event: MouseEvent) {
    this.moveEntityToTop(entity);
    this.draggingEntity = entity;
    this.selectedEntity = entity;
    this.draggingBox = event.target as HTMLElement;
    entity.dragging = true;
    entity.lastX = event.clientX;
    entity.lastY = event.clientY;
  }

  private saveUiState() {
    this.connections.forEach((connection: Connection) => {
      const from = connection.from;
      from.hubUi.vertices[connection.name] = connection.vertices;
    });
    this.entitiesService.saveEntitiesUiState(this.entities);
  }

  handleEntityStateChange(entity: Entity) {
    this.saveUiState();
    setTimeout(() => {
      this.updateConnections();
    }, 0);
  }

  vertexDrag(vertex: Point, $event: MouseEvent) {
    this.draggingVertex = vertex;
    $event.preventDefault();
  }

  startEditing(entity: Entity) {
    this.entitiesService.editEntity(entity).subscribe(() => {
      this.entitiesService.saveEntity(entity).subscribe(() => {
        this.confirmUpdateIndexes()
      });
    },
    // cancel... do nothing
    () => {});
  }

  deleteEntity(entity: Entity) {
    let result = this.dialogService.confirm(`Delete the ${entity.name} entity?\n\nAny flows associated with the entity will also be deleted.`, 'No', 'Yes');
    result.subscribe(() => {
      this.entitiesService.deleteEntity(entity);
    }, () => {});
  }

  addVertex(connection: Connection, $event: MouseEvent) {
    let p = this.pointToSvg($event.clientX, $event.clientY);

    let idx = 0;
    let min = 999999999999999999;
    let i;
    for (i = 0; i < connection.vertices.length; i++) {
      const v = connection.vertices[i];
      const distance = v.distance(p);
      if (distance < min) {
        idx = i;
        min = distance;
      }
    }

    let previous;
    if (idx === 0) {
      previous = connection.from.pos;
    } else {
      previous = connection.vertices[idx - 1];
    }

    if (connection.vertices.length > 0) {
      if (!p.isOnLine(new Line(previous, connection.vertices[idx]))) {
        let next;
        if (idx === (connection.vertices.length - 1)) {
          next = connection.end;
        } else {
          next = connection.vertices[idx + 1];
        }

        if (p.isOnLine(new Line(connection.vertices[idx], next))) {
          idx++;
        }
      }
    }

    connection.vertices.splice(idx, 0, p);
    this.draggingVertex = p;
    this.saveUiState();
  }

  removeVertex(connection: Connection, vertex: Point) {
    _.remove(connection.vertices, (v: Point) => {
      return vertex === v;
    });
    this.updateConnections();
    this.saveUiState();
  }

  /**
   * Adjust entity container coordinates based on number of entities already in UI
   * @param {Entity} entity
   */
  adjustCoords(entity: Entity) {
    entity.hubUi.x += 20*this.entities.length;
    entity.hubUi.y += 30*this.entities.length;
  }

  /**
   * Adjust entity container size based on its number of properties
   * @param {Entity} entity
   */
  adjustSize(entity: Entity) {
    entity.hubUi.height += 22*entity.definition.properties.length;
  }

  addEntity() {
    let entity = new Entity().defaultValues();
    this.entitiesService.editEntity(entity).subscribe(() => {
      this.adjustCoords(entity);
      this.adjustSize(entity);
      this.entitiesService.saveEntity(entity).subscribe(() => {
        this.confirmUpdateIndexes();
      });
    },
    // cancel... do nothing
    () => {
      console.log('cancel');
    });
  }

  /**
   * Display confirm dialog and update entity indexes upon confirmation
   */
  confirmUpdateIndexes() {
    let result = this.dialogService.confirm(
      `Saved. Update Indexes in MarkLogic?`,
      'No',
      'Yes'
    );
    result.subscribe(() => {
      this.installService.updateIndexes().subscribe(() => {
        this.snackbar.showSnackbar({
          message: 'Indexes updated.',
        });
      });
    }, () => {});
  }

}
