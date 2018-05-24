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
  public  chosenEntity: Entity;
  private entityPrimaryKey: string = '';

  // Source Document
  private currentDatabase: string = 'STAGING';
  private entitiesOnly: boolean = false;
  private searchText: string = null;
  private activeFacets: any = {};
  private currentPage: number = 1;
  private pageLength: number = 1; // pulling single record
  public  sampleDoc: any = null;
  private sampleDocSrc: any = null;
  private sampleDocSrcProps: Array<any> = [];
  public  valMaxLen: number = 15;

  // Connections, one for each row:
  // { src:  { name: 'src-prop-name',  type: 'prop-datatype' },
  //   harm: { name: 'harm-prop-name', type: 'harm-prop-datatype'} }
  public  conns: Array<any> = [];
  private connsInit: boolean = false;

  public  entityName: string;
  public  flowName: string;

  /**
   * Get entities and choose one to serve as harmonized model.
   */
  getEntities(): void {
    let self = this;
    this.entitiesService.entitiesChange.subscribe(entities => {
      this.chosenEntity = _.find(entities, (e: Entity) => {
        return e.name === this.entityName;
      });
      console.log('this.chosenEntity', this.chosenEntity);
      this.entityPrimaryKey = this.chosenEntity.definition.primaryKey;
      // Set up connections once
      if (!this.connsInit) {
        let savedConns = this.getMap();
        _.forEach(this.chosenEntity.definition.properties, function(prop) {
          // If this prop pair has been saved, load its conn
          let savedConn = _.find(savedConns, function(c) { return c['harm'].name === prop.name; });
          if (savedConn) {
            self.conns.push(savedConn);
          }
          // Else load an empty version
          else {
            self.conns.push({
              src: null,
              harm: {name: prop.name, type: prop.datatype}
            });
          }
        });
        this.connsInit = true;
      }
    });
    this.entitiesService.getEntities();
  }

  /**
   * Get sample documents and choose one to serve as source.
   */
  getSampleDoc(entityName): void {
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
    });
    this.getEntities();
    this.getSampleDoc(this.entityName);
  }

  /**
   * Handle property selection from source menu
   * @param prop Property object
   * @param proptype 'src' or 'harm'
   * @param index Index of menu (not item)
   */
  handleSelection(prop, proptype, index): void {
    // Get the corresponding connection
    let conn = this.conns[index];
    if (prop === null) {
      conn[proptype] = null;
    } else {
      console.log('conns before', this.conns);
      conn[proptype] = {
        key: prop.key,
        type: prop.type,
        val: prop.val
      };
    }
    console.log('conns after', this.conns);
  }

  /**
   * Get property objects of source document
   * @returns {Array<any>} Array of property objects
   */
  getProps() {
    let self = this;
    this.sampleDocSrcProps = [];
    _.forEach(this.sampleDocSrc['envelope']['instance'], function(val, key) {
      let prop = {
        key: key,
        val: String(val),
        type: self.getType(val)
      };
      self.sampleDocSrcProps.push(prop);
    });
    return self.sampleDocSrcProps;
  }

  /**
   * Interpret datatype of property value
   * @param property value
   * @returns {string} datatype
   */
  getType(value) {
    let result = '';
    if (moment(value, moment.ISO_8601,true).isValid()) {
      result = 'date';
    } else if (Number.isInteger(Number.parseInt(value))) {
      result = 'number';
    } else if (typeof value === 'boolean') {
      result = 'boolean';
    } else if (value === null) {
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
    let mapName = this.mapService.getName(this.entityName, this.flowName);
    let localString = localStorage.getItem("mapping");
    let localObj = (localString) ? JSON.parse(localString) : {};
    if (!localObj[this.entityName]) {
      localObj[this.entityName] = {}
    };
    if (!localObj[this.entityName][this.flowName]) {
      localObj[this.entityName][this.flowName] = {}
    };
    localObj[this.entityName][this.flowName] = {
      name: mapName,
      conns: this.conns
    }
    // Temporarily saving locally
    localStorage.setItem("mapping", JSON.stringify(localObj));
    // TODO use service to save
    this.mapService.saveMap(this.entityName, mapName, JSON.stringify(localObj));
    this.router.navigate(['/flows', this.entityName, this.flowName, 'HARMONIZE']);
  }

  /**
   * Handle cancel button event
   */
  cancelMap(): void {
    let result = this.dialogService.confirm('Cancel and lose any changes?', 'Stay On Page', 'OK');
    result.subscribe( () => {
        this.router.navigate(['/flows', this.entityName, this.flowName, 'HARMONIZE']);
      },(err: any) => {
        console.log('map cancel aborted');
      }
    );
  }

  /**
   * Retrieve the mapping artifact
   */
  getMap() {
    let result = null;
    // Temporarily saving locally
    let localString = localStorage.getItem("mapping");
    if (localString) {
      let localObj = JSON.parse(localString);
      if (localObj[this.entityName]) {
        if (localObj[this.entityName][this.flowName]) {
          result = localObj[this.entityName][this.flowName].conns;
        }
      }
    }
    // TODO use service to get
    this.mapService.getMaps(this.entityName);
    return result;
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
