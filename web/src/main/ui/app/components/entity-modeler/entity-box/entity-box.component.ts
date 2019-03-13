import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';

import { Entity, PropertyType } from '../../../models/index';
import { ResizableComponent } from '../../resizable/resizable.component';

@Component({
  selector: 'app-entity-box',
  templateUrl: './entity-box.component.html',
  styleUrls: ['./entity-box.component.scss']
})
export class EntityBoxComponent implements OnChanges, AfterViewInit {

  @ViewChild('properties') propertiesTable: ElementRef;
  @ViewChild(ResizableComponent) resizableComp;
  @Input() entity: Entity;
  @Input() selected: boolean;
  @Input() dataTypes: Array<any>;
  @Output() dragStart: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() entityStateChange: EventEmitter<Entity> = new EventEmitter<Entity>();
  @Output() onStartEditing: EventEmitter<Entity> = new EventEmitter<Entity>();
  @Output() onDeleteEntity: EventEmitter<Entity> = new EventEmitter<Entity>();

  constructor() {
  }

  ngOnChanges(changes: any) {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const width = this.entity.hubUi.width;
      const height = this.entity.hubUi.height;
      if (width > 0 && height > 0) {
        this.resizableComp.width = width;
        this.resizableComp.height = height;
      } else {
        this.resizableComp.width = this.propertiesTable.nativeElement.clientWidth;
        this.resizableComp.height = this.propertiesTable.nativeElement.clientHeight;
        this.entity.hubUi.width = this.resizableComp.width;
        this.entity.hubUi.height = this.resizableComp.height;
      }
    }, 0);
  }

  isPrimaryKey(key: string) {
    return this.entity.definition.primaryKey === key;
  }

  isRangeIndex(key: string) {
    return this.entity.definition.elementRangeIndex.indexOf(key) >= 0;
  }

  isPathRangeIndex(key: string) {
    return this.entity.definition.rangeIndex.indexOf(key) >= 0;
  }

  isWordLexicon(key: string) {
    return this.entity.definition.wordLexicon.indexOf(key) >= 0;
  }

  isRequired(key: string) {
    return this.entity.definition.required.indexOf(key) >= 0;
  }

  isPii(key: string) {
    return this.entity.definition.pii.indexOf(key) >= 0;
  }


  startEditing() {
    this.onStartEditing.emit(this.entity);
  }

  deleteEntity() {
    this.onDeleteEntity.emit(this.entity);
  }

  onSizeChange(size: any) {
    this.entity.hubUi.width = size.width;
    this.entity.hubUi.height = size.height;
    this.entityStateChange.emit(this.entity);
  }

  getType(property: PropertyType) {
    if (property.$ref) {
      return property.$ref.replace('#/definitions/', '');
    } else if (property.datatype) {
      return property.datatype;
    }
    return null;
  }

  getTypeForEdit(property: PropertyType) {
    if (property.$ref) {
      return property.$ref;
    } else if (property.datatype) {
      return property.datatype;
    }
    return null;
  }

  getCollation(property: PropertyType) {
    return property.collation || property.items.collation;
  }

  setType(property: PropertyType, value: string) {
    if (value) {
      if (value.startsWith('#/definitions/')) {
        property.$ref = value;
      } else {
        property.datatype = value;
      }
    }
  }

  handleStartDrag(event: MouseEvent) {
    this.dragStart.emit(event);
  }
}
