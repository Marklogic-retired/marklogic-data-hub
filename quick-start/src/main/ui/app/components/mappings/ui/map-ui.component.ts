import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Entity } from '../../../models/index';
import { MdlDialogService } from '@angular-mdl/core';
import { MdlSnackbarService } from '@angular-mdl/core';

import * as _ from 'lodash';
import * as moment from 'moment';
import { Mapping } from "../mapping.model";

@Component({
  selector: 'app-map-ui',
  templateUrl: './map-ui.component.html',
  styleUrls: ['./map-ui.component.scss']
})
export class MapUiComponent implements OnChanges {

  @Input() mapping: Mapping = new Mapping();
  @Input() chosenEntity: Entity = null;
  @Input() conns: object = {};
  @Input() sampleDocSrcProps: Array<any> = [];
  @Input() editURIVal: string = '';

  @Output() updateDesc = new EventEmitter();
  @Output() updateURI = new EventEmitter();
  @Output() updateMap = new EventEmitter();
  @Output() resetMap = new EventEmitter();

  private uriOrig: string = '';
  private connsOrig: object = {};

  public valMaxLen: number = 17;

  public filterFocus: object = {};
  public filterText: object = {};

  public editDescVal: string;
  public editingDesc: boolean = false;
  public editingURI: boolean = false;

  /**
   * Update the sample document based on a URI.
   */
  onUpdateURI() {
    if (Object.keys(this.conns).length > 0) {
      let result = this.dialogService.confirm(
          'Changing your source document will remove<br/>existing property selections. Proceed?',
          'Cancel', 'OK');
      result.subscribe( () => {
          this.conns = {};
          this.editingURI = false;
          this.updateURI.emit({
            uri: this.editURIVal,
            uriOrig: this.mapping.sourceURI,
            conns: this.conns,
            connsOrig: this.connsOrig,
            save: true
          });
        },(err: any) => {
          console.log('source change aborted');
          this.editingURI = false;
        },
        () => {}
      );
    } else {
      this.editingURI = false;
      this.updateURI.emit({
        uri: this.editURIVal,
        uriOrig: this.mapping.sourceURI,
        conns: this.conns,
        connsOrig: {},
        save: true
      });
    }
  }

  /**
   * Cancel the editing of the source document URI.
   */
  cancelEditURI() {
    this.editURIVal = this.mapping.sourceURI;
    this.editingURI = false;
  }

  /**
   * Handle "Enter" keypress for the source document URI box.
   * @param event Event object
   */
  keyPressURI(event) {
    if (event.key === 'Enter') {
      this.onUpdateURI();
    }
  }

  /**
   * Handle when edit URI is not found.
   * @param uri URI not found
   */
  uriNotFound(uri) {
    let result = this.dialogService.alert(
      'Document URI not found: ' + uri,
      'OK'
    );
    result.subscribe( () => {
        this.editURIVal = this.mapping.sourceURI;
        // rollback to conns from previous URI
        if (!_.isEmpty(this.connsOrig)) {
          this.conns = this.connsOrig;
        }
      },
      () => {},
      () => {}
    )
  }

  /**
   * Emit event for updating the mapping description.
   */
  onUpdateDesc() {
    this.mapping.description = this.editDescVal;
    this.updateDesc.emit(this.mapping);
    this.editingDesc = false;
  }

  /**
   * Handle "Enter" keypress for the mapping description box.
   * @param event Event object
   */
  keyPressDesc(event) {
    if (event.key === 'Enter') {
      this.onUpdateDesc();
    }
  }

  /**
   * Cancel the editing of the mapping description.
   */
  cancelEditDesc() {
    this.editDescVal = this.mapping.description;
    this.editingDesc = false;
  }

  /**
   * Display snackbar popup.
   * @param msg Message text to display in popup.
   */
  showSnackbar(msg) {
    this.snackbar.showSnackbar({
      message: msg
    });
  }

  constructor(
    private dialogService: MdlDialogService,
    private snackbar: MdlSnackbarService
  ) {}

  /**
   * Handle changes of component properties.
   * @param changes SimpleChanges object with change information.
   */
  ngOnChanges(changes: SimpleChanges) {
    // Keep values up to date when mapping changes
    if (changes.mapping) {
      this.editDescVal = this.mapping.description;
      this.editURIVal = this.mapping.sourceURI;
    }
    if (changes.conns) {
      this.connsOrig = _.cloneDeep(changes.conns.currentValue);
    }
  }

  /**
   * Handle property selection from source menu
   * @param entityPropName Entity property name of selection
   * @param srcPropName Source property name of selection
   */
  handleSelection(entityPropName, srcPropName): void {
    this.conns[entityPropName] = srcPropName;
  }

  /**
   * Clear a property selection from source menu
   * @param event Event object, used to stop propagation
   * @param entityPropName Entity property name mapping to clear
   */
  clearSelection(event, entityPropName): void {
    if (this.conns[entityPropName])
      delete this.conns[entityPropName];
    this.editingURI = false; // close edit box if open
    event.stopPropagation();
  }

  /**
   * Get property objects of source document
   * @param entityPropName Entity property name mapping to lookup
   * @param srcKey 'key', 'val' or 'type'
   * @returns {String} Value of the src data requested
   */
  getConnSrcData(entityPropName, srcKey): string {
    let data;
    let propertyKey = this.conns[entityPropName];

    if (this.sampleDocSrcProps.length > 0 && this.conns[entityPropName]) {
      let obj = _.find(this.sampleDocSrcProps, function(o) { return o && (o.key === propertyKey); });
      data = obj[srcKey];
    }

    return String(data);
  }

  /**
   * Handle save button event by emitting connection object.
   */
  onSaveMap() {
    this.updateMap.emit(this.conns);
  }

  /**
   * Handle reset button event.
   */
  onResetMap(): void {
    let result = this.dialogService.confirm(
      'Reset map to previously saved version?',
      'Cancel', 'OK');
    result.subscribe( () => {
        this.conns = this.conns
        this.resetMap.emit();
      },(err: any) => {
        console.log('reset map aborted');
      },
      () => {}
    );
  }

  /**
   * Have there been new selections since last map save?
   * @returns {boolean}
   */
  mapChanged() {
    return !_.isEqual(this.conns, this.connsOrig);
  }

  /**
   * Interpret the datatype of a property value
   * Recognize all JSON types: array, object, number, boolean, null
   * Also do a basic interpretation of dates (ISO 8601, RFC 2822)
   * @param value Property value
   * @returns {string} datatype ("array"|"object"|"number"|"date"|"boolean"|"null")
   */
  getType(value: any): string {
    let result = '';
    let RFC_2822 = 'ddd, DD MMM YYYY HH:mm:ss ZZ';
    if (_.isArray(value)) {
      result = 'array';
    } else if (_.isObject(value)) {
      result = 'object';
    }
    // Quoted numbers (example: "123") are not recognized as numbers
    else if (_.isNumber(value)) {
      result = 'number';
    }
    // Do not recognize ordinal dates (example: "1981095")
    else if (moment(value, [moment.ISO_8601, RFC_2822], true).isValid() && !/^\d+$/.test(value)) {
      result = 'date';
    } else if (_.isBoolean(value)) {
      result = 'boolean';
    } else if (_.isNull(value)) {
      result = 'null';
    } else {
      result = 'string';
    }
    return result;
  }

  /**
   * Should datatype be displayed with quotes?
   * @param property datatype
   * @returns {boolean}
   */
  isQuoted(type) {
    let typesToQuote = ['string', 'date'];
    return _.indexOf(typesToQuote, type) > -1;
  }

  /**
   * Trim start of long string and add prefix ('...trimmed-string'
   * @param str String to trim
   * @param num Character threshold
   * @param prefix Prefix to add
   * @returns {any} Trimmed string
   */
  getLastChars(str, num, prefix) {
    prefix = prefix ? prefix : '...';
    let result = str;
    if (typeof str === 'string' && str.length > num) {
      result = prefix + str.substr(str.length - num);
    }
    return result;
  }

   /**
    * Return string if sufficiently long, otherwise empty string
    * @param str String to return
    * @param num Character threshold
    * @returns {any} string
    */
   getURITooltip(str, num) {
     let result = '';
     if (typeof str === 'string' && str.length > num) {
       result = str;
     }
     return result;
   }

  /**
   * Does entity property have an element range index set?
   * @param name Name of property
   * @returns {boolean}
   */
  hasElementRangeIndex(name) {
    return _.includes(this.chosenEntity.definition.elementRangeIndex, name);
  }

  /**
   * Does entity property have a path range index set?
   * @param name Name of property
   * @returns {boolean}
   */
  hasRangeIndex(name) {
    return _.includes(this.chosenEntity.definition.rangeIndex, name);
  }

  /**
   * Does entity property have a word lexicon set?
   * @param name Name of property
   * @returns {boolean}
   */
  hasWordLexicon(name) {
    return _.includes(this.chosenEntity.definition.wordLexicon, name);
  }

  /**
   * Is an entity property required?
   * @param name Name of property
   * @returns {boolean}
   */
  isRequired(name) {
    return _.includes(this.chosenEntity.definition.required, name);
  }

  /**
   * Is an entity property personally identifiable information?
   * @param name Name of property
   * @returns {boolean}
   */
  isPII(name) {
    return _.includes(this.chosenEntity.definition.pii, name);
  }

      /**
   * Is an entity property the primary key?
   * @param name Name of property
   * @returns {boolean}
   */
  isPrimaryKey(name) {
    return _.includes(this.chosenEntity.definition.primaryKey, name);
  }

}
