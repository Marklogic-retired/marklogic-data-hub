import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Entity } from '../entities';
import { EntitiesService } from '../entities/entities.service';
import { SearchService } from '../search/search.service';

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
      _.forEach(this.chosenEntity.definition.properties, function(prop) {
          // Set up connections (all empty initially)
          self.conns.push({
            src: null,
            harm: {name: prop.name, type: prop.datatype}
          });
      });
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

        console.log('sampleDocSrcProps', this.sampleDocSrcProps);

      });
    },
    () => {},
    () => {});
  }

  constructor(
    private searchService: SearchService,
    private entitiesService: EntitiesService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.entityName = params['entityName'] || null;
      this.flowName = params['flowName'] || null;
      this.getEntities();
      this.getSampleDoc(this.entityName);
    });
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

}
