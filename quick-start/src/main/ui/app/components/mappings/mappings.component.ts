import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Entity } from '../../models';
import { EntitiesService } from '../../models/entities.service';
import { MapService } from './map.service';
import { MdlDialogService } from '@angular-mdl/core';

import * as _ from 'lodash';
import {Mapping} from "./mapping.model";
import {SearchService} from "../search/search.service";
import {NewMapComponent} from "./new-map.component";
import {Subscription} from 'rxjs';

@Component({
  template: `
    <app-mappings-ui
      [entities]="this.entities"
      [entityMappingsMap]="this.entityMappingsMap"
      (showNewMapping)="this.showNewMapping($event)"
      (editMapping)="this.editMapping($event)"
      (deleteMapping)="this.deleteMapping($event)"
    ></app-mappings-ui>
  `
})
export class MappingsComponent implements OnInit, OnDestroy {

  public subscribers: Map<string, Subscription> = new Map();

  private activeEntity: Entity;
  private activeMapping: Mapping;
  public flowName: string;

  private entitiesLoaded: boolean = false;

  public entities: Array<Entity> = new Array<Entity>();

  public mappings: Array<Mapping> = [];

  private entityMap: Map<string, Entity> = new Map<string, Entity>();

  public entityMappingsMap: Map<Entity, Array<Mapping>> = new Map<Entity, Array<Mapping>>();


  constructor(
    private mapService: MapService,
    private entitiesService: EntitiesService,
    private searchService: SearchService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: MdlDialogService
  ) {}


  /**
   * Initialize the UI.
   */
  ngOnInit() {
    let entitySub = this.entitiesService.entitiesChange.subscribe(entities => {
      this.entitiesLoaded = true;
      this.entities = entities;
      this.populateEntities();
      this.mapService.getMappings();
    });
    this.subscribers.set('entities', entitySub);

    let mapSub = this.mapService.mappingsChange.subscribe(mappings => {
      this.mappings = mappings;
      this.entities.forEach((entity: Entity) => {
        this.entityMappingsMap.set(entity, this.mapService.getMappingsByEntity(entity));
      });
    });
    this.subscribers.set('mappings', mapSub);

    this.entitiesService.getEntities();
  }

  ngOnDestroy(){
    this.subscribers.get('entities').unsubscribe();
    this.subscribers.get('mappings').unsubscribe();
  }

  populateEntities() : void {
    this.entities.forEach((entity: Entity) => {
      this.entityMap.set(entity.name, entity);
      this.docsLoaded(entity.name);
    });
  }

  getMappingsWithoutEntity() {
    let entity = new Entity();
    this.mapService.mappingsChange.subscribe( () => {
      this.entityMappingsMap.set(entity, this.mapService.getMappingsByEntity(null));
    });

    return this.entityMappingsMap.get(entity);
  }

  showNewMapping(event) {
    let actions = {
      save: (newMapName: string, newMapDesc: string) => {

        let mapObj = {
          "language" : "zxx",
          "name" : newMapName,
          "description" : newMapDesc,
          "version" : "0",
          "targetEntityType" : event.entity.info.baseUri + event.entity.name +'-' + event.entity.info.version + '/' + event.entity.name,  // TODO
          "sourceContext": '',
          "sourceURI": '',
          "properties": {}
        }


        this.mapService.saveMap(newMapName, JSON.stringify(mapObj)).subscribe((res: any) => {
          this.mapService.getMap(newMapName).subscribe((res: any) => {
            this.activeEntity = event.entity;
            this.activeMapping = new Mapping().fromJSON(res);
            this.router.navigate(['/mappings', event.entity.name, newMapName]);
          });
        });

      }
    };
    this.dialogService.showCustomDialog({
      component: NewMapComponent,
      providers: [
        { provide: 'actions', useValue: actions },
        { provide: 'entity', useValue: event.entity },
        { provide: 'mappings', useValue: event.mappings }
      ],
      isModal: true
    });
  }

  editMapping(event){
    this.activeEntity = event.entity;
    this.activeMapping = event.mapping;
    this.router.navigate(['/mappings', event.entity.name, event.mapping.name]);
  }

  deleteMapping(event): void {
    this.mapService.deleteMap(event.mapping).subscribe((res: any) => {
      this.mapService.getMappings();
      // Delete mapping currently being viewed?
      if (this.activeMapping && this.activeMapping.name === event.mapping.name) {
        this.router.navigate(['/mappings']);
      }
    });
  }

  /**
   * Check if documents for entity have been input.
   */
  docsLoaded(entityName): void {
    let activeFacets = { Collection: {
        values: [entityName]
      }};
    this.searchService.getResults('STAGING', false, null, activeFacets, 1, 1)
      .subscribe(response => {
          this.entityMap.get(entityName).hasDocs = (response.results.length > 0);
        },
        () => {},
        () => {});
  }

}
