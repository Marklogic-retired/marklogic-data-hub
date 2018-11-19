import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Entity } from '../entities';
import { EntitiesService } from '../entities/entities.service';
import { SearchService } from '../search/search.service';
import { MapService } from './map.service';
import { MdlDialogService } from '@angular-mdl/core';
import { MdlSnackbarService } from '@angular-mdl/core';

import * as _ from 'lodash';
import * as moment from 'moment';
import {Mapping} from "./mapping.model";

@Component({
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  // Entity Model
  public chosenEntity: Entity;
  private entityPrimaryKey: string = '';

  // Source Document
  private currentDatabase: string = 'STAGING';
  private entitiesOnly: boolean = false;
  private searchText: string = null;
  private activeFacets: any = {};
  private currentPage: number = 1;
  private pageLength: number = 1;
  public sampleDocURI: string = null;
  private sampleDocSrc: any = null;
  private sampleDocSrcProps: Array<any> = [];
  public valMaxLen: number = 17;

  // Connections
  public conns: Object = {};
  public connsOrig: Object = {};
  private mapPrefix: string = 'dhf-map-';

  private entityName: string;
  public mapName: string;
  public flowName: string;

  public mapping: Mapping = new Mapping();

  public filterFocus = {};
  public filterText = {};

  // Edit source URI
  public editURIVal;
  public editingURI = false;

  //edit source Context
  public editingSourceContext = false;

  //edit description
  public editDescVal;
  public editingDesc = false;
  /**
   * Load chosen entity to use as harmonized model.
   */
  loadEntity(): void {
    let self = this;
    this.entitiesService.entitiesChange.subscribe(entities => {
      this.chosenEntity = _.find(entities, (e: Entity) => {
        return e.name === this.entityName;
      });
      this.entityPrimaryKey = this.chosenEntity.definition.primaryKey;
    });
    this.entitiesService.getEntities();
  }

  /**
   * Search for a sample document by entity name and load that document by its URI.
   * @param entityName An entity name
   */
  loadSampleDoc(entityName): void {
    this.activeFacets = {
      Collection: {
        values: [entityName]
      }
    };
    this.searchService.getResults(
      this.currentDatabase,
      this.entitiesOnly,
      this.searchText,
      this.activeFacets,
      this.currentPage,
      this.pageLength
    ).subscribe(response => {
      this.sampleDocURI = response.results[0].uri;
      this.editURIVal = this.sampleDocURI;
      this.loadSampleDocByURI(this.sampleDocURI, {}, false)
    },
      () => {},
      () => {}
    );
  }

  /**
   * Load a sample document by its URI.
   * @param uri A document URI
   * @param conns A connections object in case rollback is required
   * @param save {boolean} Save map after successful load (when updating URI)
   */
  loadSampleDocByURI(uri: string, conns: Object, save: boolean): void {
    let self = this;
    this.searchService.getDoc(this.currentDatabase, uri).subscribe(doc => {
      this.sampleDocSrcProps = [];
      this.sampleDocSrc = doc;
      _.forEach(this.sampleDocSrc['envelope']['instance'], function(val, key) {
        let prop = {
          key: key,
          val: String(val),
          type: self.getType(val)
        };
        self.sampleDocSrcProps.push(prop);
      });
      this.sampleDocURI = this.editURIVal;
      this.editingURI = false;
      if (save) {
        this.saveMap();
        console.log('map saved with updated URI');
      }
    },
      (err) => {
        // URI not found; this can only occur when editing the URI
        let result = this.dialogService.alert(
          'Document URI not found: ' + uri,
          'OK'
        );
        result.subscribe( () => {
            this.editURIVal = this.sampleDocURI;
            this.editingURI = false;
            // rollback to conns from previous URI
            if (!_.isEmpty(conns)) {
              this.conns = conns;
            }
          },
          () => {},
          () => {}
          )
        }
      );
  }

  /**
   * Update the sample document based on a URI.
   */
  updateSampleDoc() {
    if (this.sampleDocURI === this.editURIVal) {
      this.editingURI = false;
    } else if (Object.keys(this.conns).length > 0) {
      let result = this.dialogService.confirm(
          'Changing your source document will remove<br/>existing property selections. Proceed?',
          'Cancel', 'OK');
      result.subscribe( () => {
          let connsOrig = _.cloneDeep(this.conns);
          this.conns = {};
          // provide connsOrig for rollback purposes if needed
          this.loadSampleDocByURI(this.editURIVal, connsOrig, true);
        },(err: any) => {
          console.log('source change aborted');
          this.editingURI = false;
        },
        () => {}
      );
    } else {
     this.loadSampleDocByURI(this.editURIVal, {}, true);
    }
  }

  /**
   * Cancel the editing of the source document URI.
   */
  cancelEditURI() {
    this.editURIVal = this.sampleDocURI;
    this.editingURI = false;
  }

  /**
   * Cancel the editing of the source document URI.
   */
  cancelEditDesc() {
    this.editDescVal = this.mapping.description;
    this.editingDesc = false;
  }

  keyPressURI(event) {
    if (event.key === 'Enter') {
      this.updateSampleDoc();
    }
  }

  updateDesc() {
    if (this.mapping.description !== this.editDescVal) {
      this.mapping.description = this.editDescVal;
      this.saveMap();
    }
    this.editingDesc = false;
  }

  keyPressDesc(event) {
    if (event.key === 'Enter') {
      this.updateDesc();
    }
  }

  constructor(
    private searchService: SearchService,
    private mapService: MapService,
    private entitiesService: EntitiesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: MdlDialogService,
    private snackbar: MdlSnackbarService,
  ) {}

  /**
   * Initialize the UI.
   */
  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.entityName = params['entity']|| null;
      this.mapName = params['map'] || null;

      this.loadEntity();
      this.loadMap();
    });
  }

  /**
   * Handle property selection from source menu
   * @param prop Property object
   * @param proptype 'src' or 'harm'
   * @param index Index of menu (not item)
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
   * Save the mapping artifact
   */
  saveMap(): void {
    let formattedConns = {};

    _.forEach(this.conns, function(srcPropName, entityPropName) {
      if (srcPropName)
        formattedConns[entityPropName] = { "sourcedFrom" : srcPropName };
    });

    let mapObj = {
        "language" : "zxx",
        "name" : this.mapName,
        "description" : this.mapping.description || "",  // TODO
        "version" : this.mapping.version || "0",
        "targetEntityType" : this.chosenEntity.info.baseUri + this.chosenEntity.name +'-' + this.chosenEntity.info.version + '/' + this.chosenEntity.name,  // TODO
        "sourceContext": this.mapping.sourceContext || "//",  // TODO
        "sourceURI": this.sampleDocURI || '',
        "properties": formattedConns
    }

    let tmpEntityName = this.chosenEntity.name;
    let tmpMapName = this.mapName;

    this.mapService.saveMap(this.mapName, JSON.stringify(mapObj)).subscribe((res: any) => {
      this.snackbar.showSnackbar({
        message: 'Mapping "' + tmpMapName + '" saved'
      });
      this.loadMap();
      this.router.navigate(['/mappings', tmpEntityName, tmpMapName]);
    });
    this.router.navigate(['/mappings']);
  }

  /**
   * Handle reset button event
   */
  resetMap(): void {
    let result = this.dialogService.confirm(
      'Reset map to previously saved version?',
      'Cancel', 'OK');
    result.subscribe( () => {
        this.loadMap();
      },(err: any) => {
        console.log('reset map aborted');
      },
      () => {}
    );
  }

  /**
   * Retrieve the mapping artifact
   */
  loadMap() {
    let self = this;

    this.mapService.getMap(this.mapName).subscribe((map: any) => {
      if(map) {
        this.mapping = map;
        this.sampleDocURI = map.sourceURI;
        this.editURIVal = this.sampleDocURI;
        this.editDescVal = map.description;
        // close any open edit inputs when changing mappings
        this.editingDesc = false;
        this.editingURI = false;
      }
      // if source URI unset in mapping, load sample source doc based on entity
      if (this.mapping && !this.mapping.sourceURI) {
        this.loadSampleDoc(this.entityName)
      }
      // else load source doc based on source URI in mapping
      else {
        this.loadSampleDocByURI(this.sampleDocURI, {}, false);
      }
      if (map && map.properties) {
        self.conns = {};
        _.forEach(map.properties, function(srcObj, entityPropName) {
          self.conns[entityPropName] = srcObj.sourcedFrom;
        });
        self.connsOrig = _.clone(self.conns);
      }
    });
  }

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

}
