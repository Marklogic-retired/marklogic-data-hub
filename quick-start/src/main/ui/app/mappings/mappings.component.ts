import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Entity } from '../entities';
import { EntitiesService } from '../entities/entities.service';
import { MapService } from './map.service';
import { MdlDialogService } from '@angular-mdl/core';

import * as _ from 'lodash';
import * as moment from 'moment';
import {Mapping} from "./mapping.model";
import {SearchService} from "../search/search.service";
import {NewMapComponent} from "./new-map.component";

@Component({
  templateUrl: './mappings.component.html',
  styleUrls: ['./mappings.component.scss'],
})
export class MappingsComponent implements OnInit {

  // Connections
  public conns: Object = {};
  private mapPrefix: string = 'dhf-map-';

  private activeEntity: Entity;
  private activeMapping: Mapping;
  public flowName: string;

  private entitiesLoaded: boolean = false;

  public entities: Array<Entity>;

  private entityMap: Map<string, Entity> = new Map<string, Entity>();

  private entityMappingsMap: Map<Entity, Array<Mapping>> = new Map<Entity, Array<Mapping>>();


  constructor(
    private mapService: MapService,
    private entitiesService: EntitiesService,
    private searchService: SearchService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: MdlDialogService
  ) {
  }

  /**
   * Initialize the UI.
   */
  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      //this.loadMap();
    });
    this.getEntities();
    this.entitiesService.entitiesChange.subscribe(entities => {
      this.mapService.getMappings();
    });
  }

  getEntities(): void {
    this.entitiesService.entitiesChange.subscribe(entities => {
    this.entitiesLoaded = true;
    this.entities = entities;
    this.entities.forEach((entity: Entity) => {
      this.entityMap.set(entity.name, entity);
      this.docsLoaded(entity.name);
      this.getMappingsByEntity(entity);
    });
  });
  this.entitiesService.getEntities();
  }

  getMappingsByEntity(entity: Entity) {
    this.mapService.mappingsChange.subscribe( () => {
      this.entityMappingsMap.set(entity, this.mapService.getMappingsByEntity(entity));
    });

    return this.entityMappingsMap.get(entity);
  }

  getMappingsWithoutEntity() {
    let entity = new Entity();
    this.mapService.mappingsChange.subscribe( () => {
      this.entityMappingsMap.set(entity, this.mapService.getMappingsByEntity(null));
    });

    return this.entityMappingsMap.get(entity);
  }

  isActiveMap(entity: Entity, mapping: Mapping): boolean {
    return this.activeEntity && this.activeEntity.name === entity.name &&
      this.activeMapping && this.activeMapping.name === mapping.name;
  }

  showNewMapping(entity: Entity) {
    let actions = {
      save: (newMapName: string) => {

        let mapObj = {
          "language" : "zxx",
          "name" : newMapName,
          "description" : "",
          "version" : "1",
          "targetEntityType" : entity.info.baseUri + '/'+ entity.name +'-0.0.' + entity.info.version + '/' + entity.name,  // TODO
          "sourceContext": '',
          "properties": {}
        }


        this.mapService.saveMap(newMapName, JSON.stringify(mapObj)).subscribe((res: any) => {
          this.mapService.getMap(newMapName).subscribe((res: any) => {
            this.activeEntity = entity;
            this.activeMapping = new Mapping().fromJSON(res);
            this.router.navigate(['/mappings', entity.name, newMapName]);
          });
        });

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
    this.activeEntity = entity;
    this.activeMapping = mapping;
    this.router.navigate(['/mappings', entity.name, mapping.name]);
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
          this.mapService.getMappings();
          // Delete mapping currently being viewed?
          if (this.activeMapping && this.activeMapping.name === mapping.name) {
            this.router.navigate(['/mappings']);
          }
        });;
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
