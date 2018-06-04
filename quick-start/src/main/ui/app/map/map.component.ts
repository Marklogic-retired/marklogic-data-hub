import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Entity } from '../entities';
import { EntitiesService } from '../entities/entities.service';
import { SearchService } from '../search/search.service';
import { MapService } from './map.service';
import { MdlDialogService } from '@angular-mdl/core';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  // Harmonized Model
  public chosenEntity: Entity;
  private entityPrimaryKey: string = '';

  // Source Document
  private currentDatabase: string = 'STAGING';
  private entitiesOnly: boolean = false;
  private searchText: string = null;
  private activeFacets: any = {};
  private currentPage: number = 1;
  private pageLength: number = 1; // pulling single record
  public sampleDoc: any = null;
  private sampleDocSrc: any = null;
  private sampleDocSrcProps: Array<any> = [];
  private valMaxLen: number = 15;

  private currentSelection: string = '';

  // Connections
  public conns: Object = [];
  private mapPrefix: string = 'dhf-map-';

  private entityName: string;
  private mapName: string;
  public flowName: string;

  private filterMenu: Array<string> = ['all', 'matching', 'string', 'number', 'date'];
  private filterSelected: string = 'all';
  public filterFocus = {};
  public filterText = {};

  public srcProps = [];


  /**
   * Get entities and choose one to serve as harmonized model.
   */
  loadMap(): void {
    this.conns = this.getMap();
  }

  /**
   * Load choosen entity and serve as harmonized model.
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
   * Get sample documents and choose one to serve as source.
   */
  loadSampleDoc(entityName): void {
    let self = this;
    this.activeFacets = { Collection: {
      values: [entityName]
    }};
    this.searchService.getResults(
      this.currentDatabase,
      this.entitiesOnly,
      this.searchText,
      this.activeFacets,
      this.currentPage,
      this.pageLength
    ).subscribe(response => {
      this.sampleDoc = response.results[0];
      // get contents of the document
      this.searchService.getDoc(this.currentDatabase, this.sampleDoc.uri).subscribe(doc => {
        this.sampleDocSrc = doc;
        _.forEach(this.sampleDocSrc['envelope']['instance'], function(val, key) {
          let prop = {
            key: key,
            val: String(val),
            type: self.getType(val)
          };
          self.sampleDocSrcProps.push(prop);
        });
        // TODO sort order feature
        //self.sampleDocSrcProps = _.sortBy(self.sampleDocSrcProps, ['key']);
        // TODO filter by type feature
        //self.sampleDocSrcProps = _.filter(self.sampleDocSrcProps, ['type', 'string']);
      });
    },
    () => {},
    () => {});
  }

  constructor(
    private searchService: SearchService,
    private mapService: MapService,
    private entitiesService: EntitiesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: MdlDialogService
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.entityName = params['entityName'] || null;
      this.flowName = params['flowName'] || null;
      this.mapName = this.mapService.getName(this.entityName, this.flowName);

      this.loadEntity();
      this.loadSampleDoc(this.entityName);
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
    // Get the corresponding connection
    this.conns[entityPropName] = srcPropName;
  }

  /**
   * Handle property selection from source menu
   * @param event Event object, used to stop propagation
   * @param entityPropName Entity property name mapping to clear
   */
  clearSelection(event, entityPropName): void {
    // Get the corresponding connection
    if (this.conns[entityPropName])
      delete this.conns[entityPropName];
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
   * Interpret datatype of property value
   * Recognize all JSON types: array, object, number, boolean, null
   * Also do a basic interpretation of dates (ISO 8601, RFC 2822)
   * @param property value
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
   * Save the mapping artifact
   */
  saveMap(): void {
    let formattedConns = {};

    _.forEach(this.conns, function(srcPropName, entityPropName) {
      if (srcPropName)
        formattedConns[entityPropName] = { "sourcedFrom" : srcPropName };
    });

    let mapObj = {
      "mapping" : {
        "language" : "zxx",
        "name" : this.mapName,
        "description" : "",  // TODO
        "version" : "1",
        "targetEntityType" : "http://marklogic.com/example/Schema-0.0.2/Person",  // TODO
        "sourceContext": "/path/to/properties/",  // TODO
        "properties": formattedConns
      }
    }

    // Temporarily saving locally
    localStorage.setItem(this.mapPrefix + this.mapName, JSON.stringify(mapObj));

    // TODO use service to save
    // this.mapService.saveMap(this.entityName, mapName, JSON.stringify(localObj));
    this.router.navigate(['/flows', this.entityName, this.flowName, 'HARMONIZE']);
  }

  /**
   * Handle cancel button event
   */
  cancelMap(): void {
    let result = this.dialogService.confirm('Cancel and lose any changes?', 'Stay On Page', 'Cancel');
    result.subscribe( () => {
        this.router.navigate(['/flows', this.entityName, this.flowName, 'HARMONIZE']);
      },(err: any) => {
        // console.log('map cancel aborted');
      }
    );
  }

  /**
   * Retrieve the mapping artifact
   */
  getMap() {
    let result, connMap;
    try {
      result = JSON.parse(localStorage.getItem(this.mapPrefix + this.mapName));
    } catch(e) {}

    if (result && result.mapping && result.mapping.properties) {
      connMap = {};
      _.forEach(result.mapping.properties, function(srcObj, entityPropName) {
        connMap[entityPropName] = srcObj.sourcedFrom;
      });
    }

    // TODO use service to get
    // this.mapService.getMaps(this.entityName);
    return connMap || {};
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

  hasElementRangeIndex(name) {
    return _.includes(this.chosenEntity.definition.elementRangeIndex, name);
  }
  hasRangeIndex(name) {
    return _.includes(this.chosenEntity.definition.rangeIndex, name);
  }
  hasWordLexicon(name) {
    return _.includes(this.chosenEntity.definition.wordLexicon, name);
  }
  isRequired(name) {
    return _.includes(this.chosenEntity.definition.required, name);
  }
  isPII(name) {
    return _.includes(this.chosenEntity.definition.pii, name);
  }

}
