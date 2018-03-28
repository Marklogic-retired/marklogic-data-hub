import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Entity } from '../entities';
import { EntitiesService } from '../entities/entities.service';
import { SearchService } from '../search/search.service';
import { MapService } from './map.service';
import { MdlDialogService } from '@angular-mdl/core';

import * as _ from 'lodash';

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
  private sampleDoc: any = null;
  private sampleDocSrc: any = null;
  private sampleDocSrcProps: Array<any> = [];
  private valMaxLen: number = 15;

  // Connections
  private conns: Array<any> = [];
  private connsInit: boolean = false;

  private entityName: string;
  private flowName: string;

  private filterMenu: Array<string> = ['all', 'matching', 'string', 'number', 'date'];
  private filterSelected: string = 'all';

  /**
   * Get entities and choose one to serve as harmonized model.
   */
  getEntities(): void {
    let self = this;
    this.entitiesService.entitiesChange.subscribe(entities => {
      this.chosenEntity = _.find(entities, (e: Entity) => {
        return e.name === this.entityName;
      });
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
        console.log('start with', self.sampleDocSrcProps);
        // TODO sort order
        self.sampleDocSrcProps = _.sortBy(self.sampleDocSrcProps, ['key']);
        // TODO filter by type
        self.sampleDocSrcProps = _.filter(self.sampleDocSrcProps, ['type', 'string']);
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

  handleSelection(prop, proptype, index): void {
    let conn = this.conns[index];
    if (prop === null) {
      conn[proptype] = null;
    } else {
      console.log('prop', prop);
      conn[proptype] = {
        key: prop.key,
        type: prop.type,
        val: prop.val
      };
    }
  }

  handleFilter(event) {
    console.log('filterChanged', event);
    this.filterSelected = event;
  }

  getProps(type) {
    console.log('type', type);
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
    // TODO filter by type
    if (this.filterSelected !== 'all') {
      if (this.filterSelected === 'type match') {
        self.sampleDocSrcProps = _.filter(self.sampleDocSrcProps, ['type', type]);
      } else {
        self.sampleDocSrcProps = _.filter(self.sampleDocSrcProps, ['type', this.filterSelected]);
      }
    }
    return self.sampleDocSrcProps;
  }

  getType(value) {
    if (value instanceof Date) {
      return 'date';
    } else if (Number.isInteger(Number.parseInt(value))) {
      return 'number';
    } else {
      return 'string';
    }
  }

  saveMap(): void {
    let mapName = this.mapService.getName(this.entityName, this.flowName);
    let localString = localStorage.getItem("mapping");
    let localObj = {};
    if (localString) {
      localObj = JSON.parse(localString);
    }
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

  cancelMap(): void {
    let result = this.dialogService.confirm('Cancel and lose any changes?', 'Stay On Page', 'Cancel');
    result.subscribe( () => {
        this.router.navigate(['/flows', this.entityName, this.flowName, 'HARMONIZE']);
      },(err: any) => {
        console.log('map cancel aborted');
      }
    );
  }

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

}
