import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Entity } from '../entities';
import { EntitiesService } from '../entities/entities.service';
import { SearchService } from '../search/search.service';
import { MapService } from './map.service';

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
            type: typeof(val)
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
    private activatedRoute: ActivatedRoute
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
    console.log('conns', this.conns);
    console.log('conn', conn);
    console.log('prop', prop);
    if (prop === null) {
      conn[proptype] = null;
    } else {
      conn[proptype] = {
        key: prop.key,
        type: prop.type,
        val: prop.val
      };
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
    this.router.navigate(['/flows', this.entityName, this.flowName, 'HARMONIZE'])
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
