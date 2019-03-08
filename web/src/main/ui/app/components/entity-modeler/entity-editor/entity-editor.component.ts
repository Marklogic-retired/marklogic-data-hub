import {
  Component,
  HostListener,
  Inject,
  ElementRef,
  ViewChild,
  AfterViewChecked
} from '@angular/core';

import { MdlDialogService, MdlDialogReference } from '@angular-mdl/core';
import { ChooseCollationComponent } from '../../choose-collation/choose-collation.component';
import { ExternalDefDialogComponent } from '../../externaldef-dialog/externaldef-dialog.component';

import { Cardinality, Entity, PropertyType } from '../../../models';

import * as _ from 'lodash';

@Component({
  selector: 'app-entity-editor',
  templateUrl: './entity-editor.component.html',
  styleUrls: ['./entity-editor.component.scss']
})
export class EntityEditorComponent implements AfterViewChecked {

  @ViewChild('dialogContent') el:ElementRef;

  entity: Entity;
  actions: any;
  dataTypes: Array<any>;

  entityBackup: string = null;

  // used for toggling > 1 of the following
  indexHeader: boolean = false;
  wordLexiconHeader: boolean = false;
  requiredHeader: boolean = false;
  piiHeader: boolean = false;

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

  propAdded: boolean = false;
  validTitle: boolean = true;

  // property name pattern: name cannot have space characters in it
  readonly PROPERTY_NAME_PATTERN = /^[^\s]+$/;
  // Entity title: no space or invalid characters
  readonly ENTITY_TITLE_REGEX = /^.*?(?=[\^\s!@#%&$\*:;<>\?/\{\|\}]).*$/;

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
    // Set property ui flags based on entity state
    this.entity.definition.properties.forEach((property) => {
      property.isPrimaryKey = this.entity.definition.primaryKey === property.name;
      property.hasElementRangeIndex = this.entity.definition.elementRangeIndex.indexOf(property.name) >= 0;
      property.hasRangeIndex = this.entity.definition.rangeIndex.indexOf(property.name) >= 0;
      property.hasWordLexicon = this.entity.definition.wordLexicon.indexOf(property.name) >= 0;
      property.required = this.entity.definition.required.indexOf(property.name) >= 0;
      property.pii = this.entity.definition.pii.indexOf(property.name) >= 0;
    }, this);
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

  addProperty() {
    this.entity.definition.properties.push(new PropertyType());
    this.propAdded = true;
  }

  ngAfterViewChecked() {
    if (this.propAdded) {
      this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
      this.propAdded = false;
    }
  }

  deleteSelectedProperties() {
    let result = this.dialogService.confirm('Really delete the selected properties?', 'No', 'Yes');
    result.subscribe(() => {
      this.entity.definition.properties.forEach((value: PropertyType) => {
        //let's check to make sure we're only matching against the selected properties
        if(value.selected) {
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

          _.remove(this.entity.definition.pii, (index: string) => {
            return (index === value.name);
          });

          _.remove(this.entity.definition.wordLexicon, (index: string) => {
            return (index === value.name);
          });
        }
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
      if (this.ENTITY_TITLE_REGEX.test(this.entity.info.title) || this.entity.info.title === '') {
        // invalid characters in title
        this.validTitle = false;
        return;
      } else {
        this.validTitle = true;
        // Set entity state based on property ui flags
        this.entity.definition.primaryKey = null;
        this.entity.definition.elementRangeIndex = [];
        this.entity.definition.rangeIndex = [];
        this.entity.definition.wordLexicon = [];
        this.entity.definition.required = [];
        this.entity.definition.pii = [];
        this.entity.definition.properties.forEach((property) => {
          if (property.isPrimaryKey) {
            this.entity.definition.primaryKey = property.name;
          }
          if (property.hasElementRangeIndex) {
            this.entity.definition.elementRangeIndex.push(property.name);
          }
          if (property.hasRangeIndex) {
            this.entity.definition.rangeIndex.push(property.name);
          }
          if (property.hasWordLexicon) {
            this.entity.definition.wordLexicon.push(property.name);
          }
          if (property.required) {
            this.entity.definition.required.push(property.name);
          }
          if (property.pii) {
            this.entity.definition.pii.push(property.name);
          }
        }, this);
        this.actions.save();
      }
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
    if (property.isPrimaryKey) {
      property.isPrimaryKey = false;
    } else {
      // Unset any existing primary key
      this.entity.definition.properties.map(function(prop) {
        prop.isPrimaryKey = false;
      });
      property.isPrimaryKey = true;
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

  togglePiiSelection() {
    if (this.selectedCount()) {
      this.piiHeader = !this.piiHeader;
      this.toggleArraySelection(this.piiHeader, 'pii');
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

  isPropertyValid(property: PropertyType) {
    let properties = this.entity.definition.properties;
    /**
     * A valid property must not:
     *  - be a duplicate
     *  - have spaces in the name
     *  - must not be empty
     */
    let duplicate = _.filter(properties, { 'name': property.name }).length > 1;
    let hasSpace = !this.PROPERTY_NAME_PATTERN.test(property.name);
    let isEmpty = !property.name;

    return !(duplicate || hasSpace || isEmpty);
  }

  /**
   * Editor is valid if all names in definition properties are valid.
   *
   * Used: for disabling 'Save' button
   * Used: for rendering error message
   *
   * TODO: more properties should be added here for validation
   * TODO: better model validation framework is planned in MLUI Team
   *
   * @returns {boolean} if the property editor is valid and ok to be saved
   */
  get isValid() {
    return this.entity.definition.properties
      .reduce((accumulated, p) => {
        return accumulated && this.isPropertyValid(p);
      }, true);
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
