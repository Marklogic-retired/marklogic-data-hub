import { Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { Entity } from '../../../../models';
import { EntitiesService } from '../../../../models/entities.service';
import { SearchService } from '../../../search/search.service';
import { MapService } from '../../../mappings/map.service';
import { ManageFlowsService } from '../../services/manage-flows.service';
import { EnvironmentService } from '../../../../services/environment';
import { MappingUiComponent } from './ui/mapping-ui.component';

import * as _ from 'lodash';
import * as moment from 'moment';
import { Mapping } from "../../../mappings/mapping.model";
import { Step } from "../../models/step.model";
import { Flow } from "../../models/flow.model";

@Component({
  selector: 'app-mapping',
  template: `
    <app-mapping-ui
      [mapping]="this.mapping"
      [targetEntity]="this.targetEntity"
      [conns]="this.conns"
      [sampleDocSrcProps]="this.sampleDocSrcProps"
      [editURIVal]="this.editURIVal"
      (updateURI)="this.updateURI($event)"
      (updateMap)="this.updateMap($event)"
    ></app-mapping-ui>
  `
})
export class MappingComponent implements OnInit {
  @ViewChild(MappingUiComponent) private mappingUI: MappingUiComponent;

  @Input() flow: Flow;
  @Input() step: Step;
  @Output() saveStep = new EventEmitter();

  // Entity Model
  public targetEntity: Entity;

  // Source Document
  private sourceDbType: string = 'STAGING';
  private entitiesOnly: boolean = false;
  private searchText: string = null;
  private currentPage: number = 1;
  private pageLength: number = 1;
  public sampleDocURI: string = null;
  private sampleDocSrc: any = null;
  public sampleDocSrcProps: Array<any> = [];

  // Connections
  public conns: object = {};
  public connsOrig: object = {};
  private mapPrefix: string = 'dhf-map-';

  private entityName: string;
  public mapName: string;
  public flowName: string;

  public mapping: any = new Mapping();

  public editURIVal: string;

  updateURI(event) {
    this.conns = event.conns;
    this.loadSampleDocByURI(event.uri, event.uriOrig, event.connsOrig, event.save);
  }

  /**
   * Update the mapping based on new connections submitted.
   */
  updateMap(conns) {
    this.conns = conns;
    this.saveMap();
  }

  constructor(
    private searchService: SearchService,
    private mapService: MapService,
    private manageFlowsService: ManageFlowsService,
    private entitiesService: EntitiesService,
    private envService: EnvironmentService
  ) {}

  getMapName(): string {
    return this.flow.name + '-' + this.step.name;
  }

  ngOnInit() {
    if (this.step) {
      this.entityName = this.step.options['targetEntity'];
      this.mapName = this.getMapName() || null;
      if (this.step.options.sourceDatabase === this.envService.settings.stagingDbName) {
        this.sourceDbType = 'STAGING';
      } else if (this.step.options.sourceDatabase === this.envService.settings.finalDbName) {
        this.sourceDbType = 'FINAL';
      }
      this.loadEntity();
      this.loadMap();
    }
  }

  loadEntity(): void {
    this.entitiesService.entitiesChange.subscribe(entities => {
      this.targetEntity = _.find(entities, (e: Entity) => {
        return e.name === this.entityName;
      });
    });
    this.entitiesService.getEntities();
  }

  loadMap() {
    let self = this;
    this.manageFlowsService.getMap(this.mapName).subscribe((map: any) => {
      if(map) {
        this.mapping = map;
        this.sampleDocURI = map.sourceURI;
        this.editURIVal = this.sampleDocURI;
      }
      this.loadSampleDoc()
      if (map && map.properties) {
        self.conns = {};
        _.forEach(map.properties, function(srcObj, entityPropName) {
          self.conns[entityPropName] = srcObj.sourcedFrom;
        });
        self.connsOrig = _.clone(self.conns);
      }
    },
    () => {},
    () => {});
  }

  loadSampleDoc() {
    let self = this;
    this.searchService.getResultsByQuery(this.step.options.sourceDatabase, this.step.options.sourceQuery, 1).subscribe(response => {
        self.targetEntity.hasDocs = (response.length > 0);
        // Can only load sample doc if docs exist
        if (self.targetEntity.hasDocs) {
          if (!this.mapping.sourceURI) {
            this.sampleDocURI = response[0].uri;
          } else {
            this.sampleDocURI = this.mapping.sourceURI;
          }
          this.editURIVal = this.sampleDocURI;
          this.loadSampleDocByURI(this.sampleDocURI, '', {}, false);

        }
      },
      () => {},
      () => {});

  }

  /**
   * Load a sample document by its URI.
   * @param uri A document URI
   * @param uriOrig Original URI in case none is found
   * @param connsOrig A connections object in case rollback is required
   * @param save {boolean} Save map after successful load.
   */
  loadSampleDocByURI(uri: string, uriOrig: string, connsOrig: Object, save: boolean): void {
    let self = this;
    this.editURIVal = uri;
    this.searchService.getDoc(this.sourceDbType, uri).subscribe(doc => {
      this.sampleDocSrcProps = [];
      this.sampleDocSrc = doc;
      _.forEach(this.sampleDocSrc['envelope']['instance'], function(val, key) {
        let prop = {
          key: key,
          val: String(val),
          type: self.getType(val)
        };
        self.sampleDocSrcProps.push(prop);
      });
      this.sampleDocURI = uri;
      this.mapping.sourceURI = uri;
      if (save) {
        this.saveMap();
        console.log('map saved');
      }
    },
      (err) => {
        this.conns = connsOrig;
        self.mappingUI.uriNotFound(uri);
        }
      );
  }

  saveMap(): void {
    let formattedConns = {};
    _.forEach(this.conns, function(srcPropName, entityPropName) {
      if (srcPropName)
        formattedConns[entityPropName] = { "sourcedFrom" : srcPropName };
    });
    let baseUri = (this.targetEntity.info.baseUri) ? this.targetEntity.info.baseUri : '',
        targetEntityType =  baseUri + this.targetEntity.name + '-' +
          this.targetEntity.info.version + '/' + this.targetEntity.name,
        mapObj = {
          language:         this.mapping.language || 'zxx',
          name:             this.mapName,
          description:      this.mapping.description || '',
          version:          this.mapping.version || '0',
          targetEntityType: targetEntityType,
          sourceContext:    this.mapping.sourceContext || '//',
          sourceURI:        this.sampleDocURI || '',
          properties:       formattedConns
        };
    console.log('save mapping', mapObj);
    this.manageFlowsService.saveMap(this.mapName, JSON.stringify(mapObj)).subscribe(resp => {
      this.manageFlowsService.getMap(this.mapName).subscribe(resp => {
        this.step.options['mapping'] = {
          name: resp['name'],
          version: resp['version']
        };
        this.saveStep.emit(this.step);
      });
    });
  }

  // TODO delete map when corresponding step is deleted
  deleteMap(): void {
    this.manageFlowsService.deleteMap(this.mapName).subscribe(resp => {
      console.log('mapping deleted', this.mapName);
    });
  }

  // Parent component can trigger reload after external step update
  stepEdited(step): void {
    if (step.id === this.step.id) {
      this.entityName = step.options['targetEntity'];
      if (step.sourceDatabase === this.envService.settings.stagingDbName) {
        this.sourceDbType = 'STAGING';
      } else if (step.sourceDatabase === this.envService.settings.finalDbName) {
        this.sourceDbType = 'FINAL';
      }
      this.loadEntity();
      this.loadMap();
    }
  }

  /**
   * Interpret the datatype of a property value
   * Recognize all JSON types: array, object, number, boolean, null
   * Also do a basic interpretation of dates (ISO 8601, RFC 2822)
   * @param value Property value
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

}
