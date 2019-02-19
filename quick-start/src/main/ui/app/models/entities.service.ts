import {EventEmitter, Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {ProjectService} from '../services/projects';
import {Subject} from 'rxjs';
import {map, share} from 'rxjs/operators';
import {SettingsService} from '../components/settings';

import {DefinitionsType} from './definitions.model';
import {Entity} from './entity.model';
import {Flow} from './flow.model';
import {Plugin} from './plugin.model';
import {PropertyType} from './property.model';

import {MdlDialogReference, MdlDialogService} from '@angular-mdl/core';

import {EntityEditorComponent} from '../components/';

import {EntityConsts} from './entity-consts';

import * as _ from 'lodash';

@Injectable()
export class EntitiesService {
  static readonly entityRefPrefix = '#/definitions/';
  coreDataTypes: Array<any> = EntityConsts.coreDataTypes;

  entityRefDataTypes: Array<any> = [];
  externalRefDataTypes: Array<any> = [];

  entities: Array<Entity>;
  entitiesChange: EventEmitter<Array<Entity>> = new EventEmitter<Array<Entity>>();

  constructor(
    private http: Http,
    private projectService: ProjectService,
    private dialogService: MdlDialogService,
    private settingsService: SettingsService
  ) {
  }

  getEntities() {
    this.http.get(this.url('/entities/')).pipe(map((res: Response) => {
      const entities: Array<any> = res.json();
      return entities.map((entity) => {
        return new Entity().fromJSON(entity);
      });
    })).subscribe((entities: Array<Entity>) => {
      this.entities = entities;
      this.entitiesChange.emit(this.entities);
      this.extractTypes();
    });
  }

  // getEntity(entityName: string) {
  //   return this.get(this.url(`/entities/${entityName}`));
  // }

  createEntity(entity: Entity) {
    return this.http.post(this.url('/entities/create'), entity).pipe(map((res: Response) => {
      return new Entity().fromJSON(res.json());
    }));
  }

  saveEntity(entity: Entity) {
    const expandedEntity = this.expandEntity(entity);
    const resp = this.http.put(this.url(`/entities/${expandedEntity.name}`), expandedEntity).pipe(map((res: Response) => {
      return new Entity().fromJSON(res.json());
    }),share(),);
    resp.subscribe((newEntity: Entity) => {
      const index = _.findIndex(this.entities, {'name': newEntity.name});
      if (index >= 0) {
        this.entities[index] = newEntity;
      } else {
        this.entities.push(newEntity);
      }
      this.entitiesChange.emit(this.entities);
      this.extractTypes();
    });
    return resp;
  }

  expandEntity(entity: Entity) {
    const supportingEntites: Array<Entity> = this.findSupportingEntities(entity);
    const definitions = new DefinitionsType();
    definitions.set(entity.name, entity.definition);
    supportingEntites.forEach((supportingEntity) => {
      definitions.set(supportingEntity.name, supportingEntity.definition);
    });
    entity.definitions = definitions;
    return entity;
  }

  /*
   * find entities that are referenced in entities recursively. Avoid infinite loop by tracking
   * entities visited.
   */
  findSupportingEntities(entity: Entity, visitedEntities: Array<string> = []): Array<Entity> {
    if (visitedEntities.length === 0) {
      visitedEntities.push(entity.name);
    }
    let supportingEntities: Array<Entity> = [];
    this.entityReferencesInEntity(entity).forEach((prop: PropertyType) => {
      const ref = prop.$ref || prop.items.$ref;
      const refEntityName = ref.substr(EntitiesService.entityRefPrefix.length);
      if (visitedEntities.findIndex((entityName: string) => refEntityName === entityName) < 0) {
        const refEntity = this.findEntityByName(refEntityName);
        visitedEntities.push(refEntityName);
        const refSupportingEntities = this.findSupportingEntities(refEntity, visitedEntities);
        supportingEntities.push(refEntity);
        if (refSupportingEntities.length > 0) {
          supportingEntities = supportingEntities.concat(refSupportingEntities);
        }
      }
    });
    return supportingEntities;
  }

  findEntityByName(entityName: string): Entity {
    return _.find(this.entities, {'name': entityName});
  }

  editEntity(entity: Entity) {
    const result = new Subject();
    const actions = {
      save: () => {
        result.next(null);
        result.complete();
      },
      cancel: () => {
        result.error(null);
      }
    };

    const editDialog = this.dialogService.showCustomDialog({
      component: EntityEditorComponent,
      providers: [
        {provide: 'entity', useValue: entity},
        {provide: 'actions', useValue: actions},
        {provide: 'dataTypes', useValue: this.getDataTypes()}
      ],
      isModal: true
    });
    editDialog.subscribe((dialogReference: MdlDialogReference) => {
    });
    return result.asObservable();
  }

  entityReferencesInEntity(entity: Entity) {
    if (entity.definition && entity.definition.properties) {
      return entity.definition.properties.filter((prop: PropertyType) => {
        return prop.$ref || (prop.items && prop.items.$ref);
      });
    } else {
      return [];
    }
  }

  deleteEntity(entityToDelete: Entity) {
    // remove references to this entity
    this.entities.forEach((entity: Entity) => {
      this.entityReferencesInEntity(entity).forEach((prop: PropertyType) => {
        if (prop.$ref && prop.$ref.endsWith(entityToDelete.name)) {
          prop.$ref = null;
        } else if (prop.items && prop.items.$ref && prop.items.$ref.endsWith(entityToDelete.name)) {
          prop.items.$ref = null;
        }
      });

      const connectionName = `${entity.name}-${entityToDelete.name}`;
      if (entity.hubUi && entity.hubUi.vertices && entity.hubUi.vertices[connectionName]) {
        delete entity.hubUi.vertices[connectionName];
      }
    });

    _.remove(this.entities, {'name': entityToDelete.name});
    this.saveEntities(this.entities);
    this.http.delete(this.url(`/entities/${entityToDelete.name}`)).subscribe(() => {
    });
    return this.entities;
  }

  deleteFlow(flow: Flow, flowType: string) {
    const resp = this.http.delete(this.url(`/entities/${flow.entityName}/flows/${flow.flowName}/${flowType}`)).pipe(share());
    resp.subscribe(() => {
      this.entities.forEach((entity: Entity) => {
        if (entity.name === flow.entityName) {
          if (flowType === 'INPUT') {
            _.remove(entity.inputFlows, (f) => {
              return f === flow;
            });
          } else {
            _.remove(entity.harmonizeFlows, (f) => {
              return f === flow;
            });
          }
        }
      });
    });
    return resp;
  }

  saveEntities(entities: Array<Entity>) {
    return this.http.post(this.url('/entities/'), entities).subscribe(() => {
      this.entitiesChange.emit(this.entities);
      this.extractTypes();
    });
  }

  saveEntitiesUiState(entities: Array<Entity>) {
    return this.http.post(this.url('/entities/ui/'), entities).subscribe(() => {
    });
  }

  createFlow(entity: Entity, flowType: string, flow: Flow) {
    return this.post(this.url(`/entities/${entity.info.title}/flows/${flowType}`), flow);
  }

  savePlugin(entity: Entity, flowType: string, flow: Flow, plugin: Plugin) {
    return this.post(
      this.url(`/plugin/save`),
      _.omit(plugin, ['cm', 'codemirrorConfig', 'history'])
    );
  }

  validatePlugin(entity: Entity, flowType: string, flow: Flow, plugin: Plugin) {
    return this.post(
      this.url(`/entities/${entity.info.title}/flows/${flowType}/${flow.flowName}/plugin/validate`),
      plugin
    );
  }

  getInputFlowOptions(flow: Flow) {
    const url = this.url(`/entities/${flow.entityName}/flows/input/${flow.flowName}/run`);
    return this.get(url);
  }

  saveInputFlowOptions(flow: Flow, mlcpOptions: any) {
    const url = this.url(
      `/entities/${flow.entityName}/flows/input/${flow.flowName}/save-input-options`);
    return this.http.post(url, mlcpOptions);
  }

  runInputFlow(flow: Flow, mlcpOptions: any) {
    const url = this.url(`/entities/${flow.entityName}/flows/input/${flow.flowName}/run`);
    const options = {
      mlcpPath: this.settingsService.mlcpPath,
      mlcpOptions: mlcpOptions
    };
    return this.http.post(url, options).subscribe(() => {
    });
  }

  saveHarmonizeFlowOptions(flow: Flow, batchSize: number, threadCount: number, mapping: any, options: any) {
    const url = this.url(`/entities/${flow.entityName}/flows/harmonize/${flow.flowName}/save-harmonize-options`);
    return this.http.post(url, {
      batchSize: batchSize,
      threadCount: threadCount,
      mapping: mapping,
      options: options
    }).subscribe(() => {
    });
  }

  runHarmonizeFlow(flow: Flow, batchSize: number, threadCount: number, options: any) {
    const url = this.url(`/entities/${flow.entityName}/flows/harmonize/${flow.flowName}/run`);
    return this.http.post(url, {batchSize: batchSize, threadCount: threadCount, options: options}).subscribe(() => {
    });
  }

  private extractTypes() {
    this.entityRefDataTypes = [];
    this.externalRefDataTypes = [];
    this.entities.forEach((entity: Entity) => {
      if (entity.info && entity.info.title) {
        this.entityRefDataTypes.push({
          label: entity.info.title,
          value: '#/definitions/' + entity.info.title
        });
      }

      if (entity.definition && entity.definition.properties) {
        entity.definition.properties.forEach((property: PropertyType) => {
          if (property.$ref && !property.$ref.startsWith(EntitiesService.entityRefPrefix)) {
            this.externalRefDataTypes.push(property.$ref);
          } else if (property.datatype === 'array') {
            if (property.items && property.items.$ref && !property.items.$ref.startsWith(EntitiesService.entityRefPrefix)) {
              this.externalRefDataTypes.push(property.items.$ref);
            }
          }
        });
      }
    });
  }

  public addExternalRefType(ref: string) {
    this.externalRefDataTypes.push({
      label: ref,
      value: ref
    });
  }

  public getDataTypes() {
    let dataTypes = [];

    dataTypes = [].concat(this.coreDataTypes.map((type: string) => {
      return {
        label: type,
        value: type
      };
    }));

    dataTypes.push({
      label: '─────────Entities─────────',
      value: '',
      disabled: true
    });

    dataTypes = dataTypes.concat(this.entityRefDataTypes);

    dataTypes.push({
      label: '───────External Refs──────',
      value: '',
      disabled: true
    });

    this.externalRefDataTypes.forEach((ref: string) => {
      dataTypes.push({
        label: ref,
        value: ref
      });
    });

    dataTypes.push({
      label: 'New External Ref...',
      value: 'NEW_EXTERNAL_REF'
    });

    return dataTypes;
  }

  public extractData = (res: Response) => {
    return res.json();
  }

  private get(url: string) {
    return this.http.get(url).pipe(map(this.extractData));
  }

  private post(url: string, data: any) {
    return this.http.post(url, data).pipe(map(this.extractData));
  }

  private url(u: string): string {
    return `/api/current-project${u}`;
  }
}
