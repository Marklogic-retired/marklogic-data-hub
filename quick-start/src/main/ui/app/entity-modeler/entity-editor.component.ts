import {
  Component,
  HostListener,
  Inject,
} from '@angular/core';

import { MdlDialogService, MdlDialogReference } from '@angular-mdl/core';
import { ChooseCollationComponent } from './choose-collation.component';
import { ExternalDefDialogComponent } from './externaldef-dialog.component';

import { Cardinality, Entity, PropertyType } from '../entities';

import * as _ from 'lodash';

@Component({
  selector: 'app-entity-editor',
  templateUrl: './entity-editor.component.html',
  styleUrls: ['./entity-editor.component.scss']
})
export class EntityEditorComponent {
  entity: Entity;
  actions: any;
  dataTypes: Array<any>;

  entityBackup: string = null;

  // used for toggling > 1 of the following
  indexHeader: boolean = false;
  wordLexiconHeader: boolean = false;
  requiredHeader: boolean = false;

  cardinalities: Array<any> = [
    {
      label: '1..1',
      value: 'ONE_TO_ONE'
    },
    {
      label: '1..∞',
      value: 'ONE_TO_MANY'
    }
  ];

  constructor(
    private dialog: MdlDialogReference,
    private dialogService: MdlDialogService,
    @Inject('entity') entity,
    @Inject('actions') actions: any,
    @Inject('dataTypes') dataTypes
  ) {
    this.entity = entity;
    this.actions = actions;
    this.dataTypes = dataTypes;
    this.entityBackup = JSON.stringify(this.entity);
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
    } else if (property.datatype && property.datatype !== 'array') {
      return property.datatype;
    } else if (property.datatype === 'array') {
      if (property.items.$ref) {
        return property.items.$ref;
      } else if (property.items.datatype) {
        return property.items.datatype;
      }
    }
    return null;
  }

  setType(property: PropertyType, value: string) {
    if (!value) {
      return;
    }

    if (value === 'NEW_EXTERNAL_REF') {
      let actions = {
        save: (ref: string) => {
          console.log(`saved: ${ref}`);
        },
        cancel: () => {
          console.log('canceled');
        }
      };
      let pDialog = this.dialogService.showCustomDialog({
        component: ExternalDefDialogComponent,
        providers: [
          { provide: 'property', useValue: property },
          { provide: 'actions', useValue: actions}
        ],
        isModal: true
      });
      pDialog.subscribe( (dialogReference: MdlDialogReference) => {
         console.log('dialog visible', dialogReference);
      });
    } else {
      property.setType(value);
    }
  }

  getCardinality(property: PropertyType) {
    return property.datatype === 'array' ? 'ONE_TO_MANY' : 'ONE_TO_ONE';
  }

  setCardinality(property: PropertyType, value: string) {
    let cardinality: Cardinality = Cardinality.ONE_TO_ONE;
    if (value === 'ONE_TO_MANY') {
      cardinality = Cardinality.ONE_TO_MANY;
    }

    property.setCardinality(cardinality);
  }

  getCollation(property: PropertyType) {
    return property.collation || property.items.collation;
  }

  setCollation(property: PropertyType) {
    let actions = {
      save: (collation: string) => {
        console.log(`saved: ${collation}`);
        property.setCollation(collation);
      },
      cancel: () => {
        console.log('canceled');
      }
    };
    let pDialog = this.dialogService.showCustomDialog({
      component: ChooseCollationComponent,
      providers: [
        { provide: 'collation', useValue: property.collation },
        { provide: 'actions', useValue: actions}
      ],
      isModal: true
    });
    pDialog.subscribe( (dialogReference: MdlDialogReference) => {
       console.log('dialog visible', dialogReference);
    });
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

  addProperty() {
    this.entity.definition.properties.push(new PropertyType());
  }

  deleteSelectedProperties() {
    let result = this.dialogService.confirm('Really delete the selected properties?', 'No', 'Yes');
    result.subscribe(() => {
      this.entity.definition.properties.forEach((value: PropertyType) => {
        if (this.entity.definition.primaryKey === value.name) {
          this.entity.definition.primaryKey = null;
        }

        _.remove(this.entity.definition.elementRangeIndex, (index: string) => {
          return (index === value.name);
        });

        _.remove(this.entity.definition.rangeIndex, (index: string) => {
          return (index === value.name);
        });

        _.remove(this.entity.definition.required, (index: string) => {
          return (index === value.name);
        });

        _.remove(this.entity.definition.wordLexicon, (index: string) => {
          return (index === value.name);
        });
      });

      _.remove(this.entity.definition.properties, (prop: PropertyType) => {
        return prop.selected;
      });

    }, () => {});
  }

  selectedCount() {
    return _.filter(this.entity.definition.properties, { 'selected': true }).length;
  }

  saveEntity() {
    if (this.actions.save) {
      this.actions.save();
    }
    this.dialog.hide();
  }

  cancel(): void {
    this.entity.fromJSON(JSON.parse(this.entityBackup));
    if (this.actions.cancel) {
      this.actions.cancel();
    }
    this.dialog.hide();
  }

  @HostListener('keydown.enter')
  public save() {
    this.saveEntity();
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.cancel();
  }

  toggleSelection($event) {
    const checked = $event.target.checked;
    this.entity.definition.properties.forEach((prop: PropertyType) => {
      prop.selected = checked;
    });
  }

  togglePrimaryKey(property: PropertyType) {
    if (this.entity.definition.primaryKey === property.name) {
      this.entity.definition.primaryKey = null;
    } else {
      this.entity.definition.primaryKey = property.name;
    }
  }

  toggleRangeIndex(property: PropertyType) {
    let idx = this.entity.definition.elementRangeIndex.indexOf(property.name);
    if (idx >= 0) {
      this.entity.definition.elementRangeIndex.splice(idx, 1);
    } else {
      this.entity.definition.elementRangeIndex.push(property.name);
    }
  }

  togglePathRangeIndex(property: PropertyType) {
    let idx = this.entity.definition.rangeIndex.indexOf(property.name);
    if (idx >= 0) {
      this.entity.definition.rangeIndex.splice(idx, 1);
    } else {
      this.entity.definition.rangeIndex.push(property.name);
    }
  }

  toggleRangeIndexSelection() {
    if (this.selectedCount()) {
      this.indexHeader = !this.indexHeader;
      this.toggleArraySelection(this.indexHeader, 'elementRangeIndex');
    }
  }

  togglePathRangeIndexSelection() {
    if (this.selectedCount()) {
      this.indexHeader = !this.indexHeader;
      this.toggleArraySelection(this.indexHeader, 'rangeIndex');
    }
  }

  toggleWordLexiconSelection() {
    if (this.selectedCount()) {
      this.wordLexiconHeader = !this.wordLexiconHeader;
      this.toggleArraySelection(this.wordLexiconHeader, 'wordLexicon');
    }
  }


  toggleRequiredSelection() {
    if (this.selectedCount()) {
      this.requiredHeader = !this.requiredHeader;
      this.toggleArraySelection(this.requiredHeader, 'required');
    }
  }

  toggleArraySelection(checked: boolean, field: string) {
    let indexes = [];
    this.entity.definition.properties.forEach((prop: PropertyType) => {
      if (prop.selected) {
        indexes.push(prop.name);
      }
    });

    if (checked) {
      this.entity.definition[field] = _.uniq(this.entity.definition[field].concat(indexes));
    } else {
      _.remove(this.entity.definition[field], (idx: string) => {
        return indexes.indexOf(idx) >= 0;
      });
    }
  }

  toggleWordLexicon(property: PropertyType) {
    let idx = this.entity.definition.wordLexicon.indexOf(property.name);
    if (idx >= 0) {
      this.entity.definition.wordLexicon.splice(idx, 1);
    } else {
      this.entity.definition.wordLexicon.push(property.name);
    }
  }

  toggleRequired(property: PropertyType) {
    let idx = this.entity.definition.required.indexOf(property.name);
    if (idx >= 0) {
      this.entity.definition.required.splice(idx, 1);
    } else {
      this.entity.definition.required.push(property.name);
    }
  }

  onDescKey($event: KeyboardEvent, propertyIndex: number) {
    if (
      (propertyIndex === (this.entity.definition.properties.length - 1)) &&
      $event.keyCode === 9 &&
      !$event.shiftKey
    ) {
      this.addProperty();
    }
  }

}
