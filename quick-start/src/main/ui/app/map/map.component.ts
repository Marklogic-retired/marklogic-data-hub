import { Component } from '@angular/core';
import { Entity } from '../entities';
import { EntitiesService } from '../entities/entities.service';
import { SearchService } from '../search/search.service';

import * as _ from 'lodash';

@Component({
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {
  // Harmonized Entity
  public entities: Array<Entity>;
  public chosenEntity: Entity;
  private entityPrimaryKey: string = '';

  // Sample Doc
  private currentDatabase: string = 'STAGING';
  private entitiesOnly: boolean = false;
  private searchText: string = null;
  private activeFacets: any = {};
  private currentPage: number = 1;
  private pageLength: number = 1; // pulling single record
  private sampleDoc: any = null;
  private sampleDocSrc: any = null;
  private sampleDocSrcKeys: Array<string> = [];
  private sampleDocSrcVals: Array<string> = [];
  private sampleDocSrcValTypes: Array<string> = [];
  private docValMaxLen: number = 15;

  getEntities(): void {
    this.entitiesService.entitiesChange.subscribe(entities => {
      this.entities = entities;
      this.chosenEntity = this.entities[0]; // currently just taking the first entity defined. Will add choice via UI later
      this.entityPrimaryKey = this.chosenEntity.definition.primaryKey;
    });
    this.entitiesService.getEntities();
  }

  getSampleDoc(): void {
    let self = this;
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
        _.forEach(this.sampleDocSrc, function(val, key) {
          self.sampleDocSrcKeys.push(key);
          self.sampleDocSrcVals.push(String(val));
          self.sampleDocSrcValTypes.push(typeof(val));
        });      
      });
    },
    () => {},
    () => {});   
  }
  
  constructor(
    private searchService: SearchService,
    private entitiesService: EntitiesService) {
    this.getEntities();
    this.getSampleDoc(); 
  }

  overEvent(index, event) {
    console.log(index, event);
  }

}
