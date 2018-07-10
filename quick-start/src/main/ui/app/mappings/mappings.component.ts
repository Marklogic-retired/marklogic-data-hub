import { Router, ActivatedRoute, Params } from '@angular/router';
import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import { Entity } from '../entities';
import { EntitiesService } from '../entities/entities.service';
import { MapService } from './map.service';
import { MdlDialogService } from '@angular-mdl/core';

import * as _ from 'lodash';
import {Mapping} from "./mapping.model";
import {SearchService} from "../search/search.service";
import {NewMapComponent} from "./new-map.component";
import {Subscriber} from "rxjs/Subscriber";

@Component({
  templateUrl: './mappings.component.html',
  styleUrls: ['./mappings.component.scss'],
})
export class MappingsComponent implements OnInit, OnDestroy, AfterViewInit {

  public subscribers: Map<string, Subscriber<any>> = new Map();

  private entityName: string;
  private mapName: string;
  public flowName: string;

  private entitiesLoaded: boolean = false;

  public entities: Array<Entity> = new Array<Entity>();

  public mappings: Array<Mapping> = [];

  private entityMap: Map<string, Entity> = new Map<string, Entity>();

  private entityMappingsMap: Map<Entity, Array<Mapping>> = new Map<Entity, Array<Mapping>>();


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

  ngAfterViewInit() {

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

  showNewMapping(entity: Entity) {
    let actions = {
      save: (newMapName: string) => {
        this.router.navigate(['/mappings/map'], {queryParams: {entityName: entity.name, mapName: newMapName}});
      }
    };
    this.dialogService.showCustomDialog({
      component: NewMapComponent,
      providers: [
        { provide: 'actions', useValue: actions },
        { provide: 'entity', useValue: entity}
      ],
      isModal: true
    });
  }

  editMapping(entity: Entity, mapping: Mapping){
    this.router.navigate(['/mappings/map'], {queryParams: {entityName: entity.name, mapName: mapping.name}});
  }

  deleteMapping(event: MouseEvent, mapping: Mapping): void {
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    if (event.preventDefault) {
      event.preventDefault();
    }
    event.cancelBubble = true;
    this.dialogService.confirm(`Really delete ${mapping.name} mapping?`, 'Cancel', 'Delete').subscribe(() => {
        this.mapService.deleteMap(mapping).subscribe((res: any) => {
        });
      },
      () => {});
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
