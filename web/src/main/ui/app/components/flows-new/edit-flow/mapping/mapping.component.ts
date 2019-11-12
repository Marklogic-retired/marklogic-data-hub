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
      [docUris]="this.docUris"
      [sampleDocNestedProps]="this.sampleDocNestedProps"
      [step]="this.step"
      [editURIVal]="this.editURIVal"
      [functionLst]="functionLst"
      [entityName]="this.entityName"
      [entityNested] = "entityNested"
      [nmspace] = "nmspace"
      [xmlSource]="xmlSource"
      [disableURINavLeft]="disableURINavLeft"
      [disableURINavRight]="disableURINavRight"
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
  public entityNested: Entity;
  public dataSourceEntity: {};

  // Source Document
  private sourceDbType: string = 'STAGING';
  private entitiesOnly: boolean = false;
  private searchText: string = null;
  private currentPage: number = 1;
  private pageLength: number = 1;
  public sampleDocURI: string = null;
  private sampleDocSrc: any = null;
  public sampleDocSrcProps: Array<any> = [];
  public docUris: Array<any> = [];
  public sampleDocNestedProps:  Array<any> = [];
  public nestedDoc: Array<any> = [];
  public xmlSource: boolean = false;
  public disableURINavLeft: boolean = true;
  public disableURINavRight: boolean = false;

  // Connections
  public conns: object = {};
  public connsNested: boolean = false;
  public connsOrig: object = {};
  private mapPrefix: string = 'dhf-map-';

  public entityName: string;
  public mapName: string;
  public flowName: string;

  public mapping: any = new Mapping();
  private isSourceURIInvalid: boolean = false;
  public editURIVal: string;
  public functionLst: object = {};

  //Helper

  public nmspace: object = {};

  updateURI(event) {
    this.conns = event.conns;
    this.loadSampleDocByURI(event.uri, event.uriOrig, event.connsOrig, event.save);
  }

  /**
   * Update the mapping based on new connections submitted.
   */
  updateMap(obj) {
    this.conns = obj.conns;
    this.connsNested = obj.nested;
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
      if (!this.step.options.collections || this.step.options.collections.length === 0) {
        this.step.options.collections = [`${this.step.name}`, 'mdm-content', this.entityName];
      }
      this.loadEntity();
    }
  }

  loadEntity(): void {
    this.entitiesService.getEntity(this.entityName)
      .subscribe(result => {
        this.targetEntity = result;
        // Get entity in full nested form
        this.entitiesService.getEntityNested(this.entityName)
          .subscribe(result => {
            this.entityNested = result;
            this.loadMap();
            this.getFunctionList();
          });
      });
  }

  loadMap() {
    let self = this;
    this.manageFlowsService.getMap(this.mapName).subscribe((map: any) => {
      if(map) {
        this.mapping = map;
        this.sampleDocURI = map.sourceURI;
        this.editURIVal = this.sampleDocURI;
      }
      this.loadSampleDoc();
      if (map && map.properties) {
        this.isNestedMap();
        console.log("isNested: " + this.connsNested);
        self.conns = {};
        if(!self.connsNested ) {
          _.forEach(map.properties, function(srcObj, entityPropName) {
            self.conns[entityPropName] = srcObj.sourcedFrom;
          });
        }
        else {
          self.conns = map.properties;
        }
        self.connsOrig = _.clone(self.conns);
      }
    },
    () => {},
    () => {});
  }

  isNestedMap() {
    this.connsNested = Object.keys(this.mapping.properties).findIndex(key => this.mapping.properties[key].hasOwnProperty("targetEntityType")) > -1 ;
  }


  loadSampleDoc() {
    let self = this;
    self.docUris = [];
    this.searchService.getResultsByQuery(this.step.options.sourceDatabase, this.step.options.sourceQuery, 20, true).subscribe(response => {
        if (self.targetEntity) {
          self.targetEntity.hasDocs = (response.length > 0);
          self.disableURINavRight = response.length > 1 ? false : true;
          // Can only load sample doc if docs exist
          if (self.targetEntity.hasDocs) {
             response.forEach(doc => {
              self.docUris.push(doc.uri);
            })
            if (!this.mapping.sourceURI) {
              this.sampleDocURI = response[0].uri;
              this.editURIVal = this.sampleDocURI;
              if (this.isSourceURIInvalid && this.sampleDocURI){
                this.isSourceURIInvalid = false;
                this.loadSampleDocByURI(this.sampleDocURI, '', {}, true);
              }
              else {
                this.loadSampleDocByURI(this.sampleDocURI, '', {}, false);
              }
            } else {
              this.sampleDocURI = this.mapping.sourceURI;
              this.editURIVal = this.sampleDocURI;
              this.loadSampleDocByURI(this.sampleDocURI, '', {}, false);
            }
          }
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
      this.sampleDocSrc = this.normalizeToJSON(doc);
      //legacy UI code
      let startRoot = this.sampleDocSrc['envelope'] ? this.sampleDocSrc['envelope']['instance'] : this.sampleDocSrc;
      const rootKeys = Object.keys(startRoot);
      if (rootKeys.length === 1 && startRoot[rootKeys[0]] instanceof Object) {
        startRoot = startRoot[rootKeys[0]];
      }
      
      //New mapping code
      let startRootNew = this.sampleDocSrc['envelope'] ? this.sampleDocSrc['envelope']['instance'] : this.sampleDocSrc;

      _.forEach(startRoot, function (val, key) {
          let prop = {
            key: key,
            val: ((val === null) || (typeof(val) === "object" && ['Object','Array'].includes(val.constructor.name))) ? val : String(val),
            type: self.getType(val)
          };
          self.sampleDocSrcProps.push(prop);
        });
      this.sampleDocURI = uri;
      this.mapping.sourceURI = uri;
      self.nestedDoc = [];
      let ParentKeyValuePair = [];
      _.forEach(startRootNew, function (val, key) {
        if(val != null){
          if(val.constructor.name === "Object" || val.constructor.name === "Array"){
            ParentKeyValuePair.push(key+JSON.stringify(val));
          } else {
            ParentKeyValuePair.push(key+val);
          }
          
        } else {
          ParentKeyValuePair.push(key);
        }
        
      });
      self.sampleDocNestedProps = this.updateNestedDataSourceNew(startRootNew,ParentKeyValuePair);
      console.log("startRootNew",startRootNew);
      console.log("self.sampleDocNestedProps",self.sampleDocNestedProps)
      if (save) {
        this.saveMap();
        console.log('map saved');
      }
    },
      (err) => {
        if ( !this.isSourceURIInvalid) {
          this.isSourceURIInvalid = true;
          this.mapping.sourceURI = null;
          this.loadSampleDoc();
        }
        else {
          this.conns = connsOrig;
          self.mappingUI.uriNotFound(uri);
        }
      }
    );
  }

  normalizeToJSON(input: any): any {
    let self = this;
    self.xmlSource = false;
    if (typeof input === 'string') {
      const parsedXML = new DOMParser().parseFromString(input, 'application/xml');
      const object = {};
      self.nmspace = {};
      self.xmlSource = true;

      const nodeToJSON = function (obj, node) {

        //loading attributes for parent node
        if (!node.childNodes) {
          self.loadAttributes(node, obj, 'parentNode');
        }
        let countNodes = self.countChildNodes(node);

        node.childNodes.forEach((childNode) => {
          if (countNodes && childNode.nodeName in countNodes && countNodes[childNode.nodeName] > 1) {

            if (childNode.childNodes.length === 0 || (childNode.childNodes.length === 1 && childNode.firstChild.nodeType === Node.TEXT_NODE)) {
              if (childNode.nodeName !== '#text') {

                //loading namespaces
                let nodeWithAttr = '';
                if (childNode.attributes) {
                  nodeWithAttr = self.loadNamespace(childNode);
                }
                if(nodeWithAttr == ''){
                  nodeWithAttr = self.checkNamespacePrefix(childNode);
                }

                let tempObj = {};

                tempObj[nodeWithAttr == '' ? "/" + childNode.nodeName : "/" + nodeWithAttr] = childNode.textContent;

                if (!obj[childNode.nodeName + "/"]) {
                  if (childNode.nodeName !== '#text') {
                    obj[childNode.nodeName + "/"] = [];
                  }
                };

                if (obj[childNode.nodeName + "/"].constructor.name === 'Array') {
                  obj[childNode.nodeName + "/"].push(tempObj);
                }

                //loading attributes for parent node
                self.loadAttributes(childNode, obj, 'multipleNodes');
              }
            } else {
              let tempObj = {};

              if (!obj[childNode.nodeName + "/"]) {
                if (childNode.nodeName !== '#text') {
                  obj[childNode.nodeName + "/"] = [];
                }
              };

              //loading attributes

              self.loadAttributes(childNode, obj, 'singleNode');

              nodeToJSON(tempObj, childNode);

              //Loading namespaces
              let nodeWithAttr = '';
              if (childNode.attributes) {
                nodeWithAttr = self.loadNamespace(childNode);
              }
              if(nodeWithAttr == ''){
                nodeWithAttr = self.checkNamespacePrefix(childNode);
              }

              let ob = { [`${nodeWithAttr == '' ? childNode.nodeName : nodeWithAttr}`]: tempObj }
              if (obj[childNode.nodeName + "/"].constructor.name === 'Array') {
                obj[childNode.nodeName + "/"].push(ob);
              }
            }
          } else {

            if (childNode.childNodes.length === 0 || (childNode.childNodes.length === 1 && childNode.firstChild.nodeType === Node.TEXT_NODE)) {
              if (childNode.nodeName !== '#text') {
                //loading namespaces
                let nodeWithAttr = '';
                if (childNode.attributes) {
                  nodeWithAttr = self.loadNamespace(childNode);
                }
                if(nodeWithAttr == '' && childNode.nodeName.split(':').length > 1){
                  let name = childNode.nodeName.split(':')[0];
                  console.log("called outside namspace",name,name == 'r',self.nmspace.hasOwnProperty('r') ,self.nmspace,self.checkNamespacePrefix(childNode))
                }
                if(nodeWithAttr == ''){
                  nodeWithAttr = self.checkNamespacePrefix(childNode);
                }
                obj[nodeWithAttr == '' ? childNode.nodeName : nodeWithAttr] = childNode.textContent;

                //loading attributes
                self.loadAttributes(childNode, obj, 'singleNode');
              }
            }
            else {
              let nodeWithAttr = '';
              if (!['envelope', 'headers', 'instance', 'triples', 'attachments'].includes(childNode.nodeName)) {
                if (childNode.attributes) {
                  //loading namespaces
                  nodeWithAttr = self.loadNamespace(childNode);
                }
                if(nodeWithAttr == ''){
                  nodeWithAttr = self.checkNamespacePrefix(childNode);
                }
              }
              obj[nodeWithAttr == '' ? childNode.nodeName : nodeWithAttr] = {};
              //loading attributes
              self.loadAttributes(childNode, obj, 'singleNode');

              nodeToJSON(obj[nodeWithAttr == '' ? childNode.nodeName : nodeWithAttr], childNode);
            }
          }
        });
      };
      nodeToJSON(object, parsedXML);
      return object;

    }
    return input;
  }

  countChildNodes(node): object {
    let nodeCounter = {};
    if (node.childNodes.length !== 0) {
        
      node.childNodes.forEach((childNode) => {
        if(childNode.nodeName in nodeCounter){
          nodeCounter[childNode.nodeName] = nodeCounter[childNode.nodeName] + 1;
        } else {
          nodeCounter[childNode.nodeName] = 1;
        }
      });
  
    }
    return nodeCounter;
  }

  //Load namespace for any node which is passed.
  loadNamespace(node): string {
    let self = this;
    let nodeWithAttr = '';
    let count = 0;
    for (let name of node.getAttributeNames()) {
      if (name.startsWith('xmlns') && node.getAttribute(name) != '') {
        if(count == 0){
          let indCheck = node.getAttribute(name).lastIndexOf('/');
          let ind = indCheck != -1 ? indCheck + 1 : 0;
          
          //self.nmspace[node.getAttribute(name).slice(ind)] = node.getAttribute(name);
          if(name.split(':').length > 1){
            self.nmspace[name.split(':')[1]] = node.getAttribute(name);
            self.nmspace[node.getAttribute(name).slice(ind)] = node.getAttribute(name);
          } else {
            self.nmspace[node.getAttribute(name).slice(ind)] = node.getAttribute(name);
          }
          if(node.nodeName.split(':').length > 1){
            nodeWithAttr = node.getAttribute(name).slice(ind) + ':' + node.nodeName.split(':')[1];
          } else {
            nodeWithAttr = node.getAttribute(name).slice(ind) + ':' + node.nodeName;
          }
          
          count = count + 1;
        }
      }
    }
    return nodeWithAttr;
  }

  checkNamespacePrefix(node): string {
    let newNode = '';
    if(node.nodeName.split(':').length > 1 && node.nodeName.split(':')[0] in this.nmspace) {
      console.log("called nmspace", node.nodeName)
      let indCheck = this.nmspace[node.nodeName.split(':')[0]].lastIndexOf('/');
      let ind = indCheck != -1 ? indCheck + 1 : 0;
      newNode = this.nmspace[node.nodeName.split(':')[0]].slice(ind) + ':' + node.nodeName.split(':')[1];
    }
    return newNode;
  }
  //load attributes for an xml node
  loadAttributes(node, obj, type: string): void {
    if (type === 'singleNode') {
      //Nodes having single instance at any level
      if (node.attributes) {
        for (let name of node.getAttributeNames()) {
          if (!name.startsWith('xmlns')) {
            obj[node.nodeName + "/" + "@" + name] = node.getAttribute(name);
          }
        }
      }
    } else if (type === 'multipleNodes') {
      //Nodes having multiple instances at any level
      if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
          if (!node.attributes.item(i).name.startsWith('xmlns')) {
            let tempObjAttr = {};
            tempObjAttr["/" + node.nodeName + "/" + "@" + node.attributes.item(i).name] = node.attributes.item(i).value;
            if (obj[node.nodeName+"/"].constructor.name === 'Array') {
              obj[node.nodeName+"/"].push(tempObjAttr);
            }
          } 
        }
      }
    } else {
      //parent Node
      if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
          if (!node.attributes.item(i).name.startsWith('xmlns')) {
            obj["@" + node.attributes.item(i).name] = node.attributes.item(i).value;
          }
        }
      }
    }
  }

  saveMap(): void {
    console.log('saveMap conns', this.conns);
    let formattedConns = {};
    // Nested and legacy data structures differ
    if (this.connsNested) {
      // TODO handle targetEntityType for objects, arrays
      formattedConns = this.conns;
    } else {
      _.forEach(this.conns, function(srcPropName, entityPropName) {
        if (srcPropName)
          formattedConns[entityPropName] = { "sourcedFrom" : srcPropName };
      });
    }
    let baseUri = (this.targetEntity.info.baseUri) ? this.targetEntity.info.baseUri : '',
        targetEntityType =  baseUri + this.targetEntity.name + '-' +
          this.targetEntity.info.version + '/' + this.targetEntity.name,
        mapObj = {
          lang:         this.mapping.lang || 'zxx',
          name:             this.mapName,
          description:      this.mapping.description || '',
          version:          this.mapping.version || '0',
          targetEntityType: targetEntityType,
          sourceContext:    this.mapping.sourceContext || '/',
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
    }
  }

  // Parent component can trigger mapping reset if source changes
  sourceChanged(): void {
    this.sampleDocURI = '';
    this.saveMap();
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

  getFunctionList (){
    this.manageFlowsService.getFunctions().subscribe( resp => {
      this.functionLst = resp;
    });
  }

  // Recursive logic to flatten the nested source data

  updateNestedDataSourceNew(sourcePropDoc, ParentKeyValuePair: Array<any>, parentKey: String = ""): Array<any> {
    let self = this;

    _.forEach(sourcePropDoc, function (val, key) {
      if (val != null && val!= "") {
        if (val.constructor.name === "Object") {
          if (ParentKeyValuePair.includes(key + JSON.stringify(val))) {
            parentKey = key;
          } else {
            if (parentKey === "") {
              parentKey = key;
            } else {
              parentKey = parentKey + "/" + key;
            }
          }
          let currKey = parentKey.replace(/[^\/]+\/\/\//g, '').replace(/[^\/]+\/\//g, '');
          let propty = {
            key: currKey,
            val: "",
            type: self.getType(val)
          };
          self.nestedDoc.push(propty);
          self.updateNestedDataSourceNew(val, ParentKeyValuePair, parentKey);
        } else if (val.constructor.name === "Array") {
          if(key.lastIndexOf('/') !== key.length-1 || (key.lastIndexOf('/') === key.length-1 && key.split('/').length <= 2)){
          if (ParentKeyValuePair.includes(key + JSON.stringify(val))) {
            parentKey = key;
          } else {
            if (parentKey === "") {
              parentKey = key;
            } else {
              parentKey = parentKey + "/" + key;
            }
          }
          if(key.lastIndexOf('/') !== key.length-1){
            let propty = {
              key: parentKey,
              val: "",
              type: self.getType(val)
            };
            self.nestedDoc.push(propty);
          }
            
          }
          
          val.forEach(obj => {
            if(obj.constructor.name == "String"){
              let propty = {
                key: parentKey+ "/",
                val: obj,
                type: self.getType(obj)
              };
              self.nestedDoc.push(propty);
            } else {
              self.updateNestedDataSourceNew(obj, ParentKeyValuePair, parentKey);
            }
          });
        } else {
          let currKey = "";
          if (ParentKeyValuePair.includes(key + val)) {
            currKey = key;
          } else {
            if (parentKey === "") {
              currKey = key;
            } else {
              currKey = parentKey + "/" + key;
            }
          }
          let propty = {
            key: currKey.replace(/[^\/]+\/\/\//g, '').replace(/[^\/]+\/\//g, ''),
            val: String(val),
            type: self.getType(val)
          };
          self.nestedDoc.push(propty);
        }
      } else {
        let currKey = "";
          if (ParentKeyValuePair.includes(key + val)) {
            currKey = key;
          } else {
            if (parentKey === "") {
              currKey = key;
            } else {
              currKey = parentKey + "/" + key;
            }
          }
        let propty = {
          key: currKey.replace(/[^\/]+\/\/\//g, '').replace(/[^\/]+\/\//g, ''),
          val: "",
          type: self.getType(val)
        };
        self.nestedDoc.push(propty);

      }
      if(parentKey.split('/').pop() in sourcePropDoc) {
        parentKey = parentKey.slice(0,parentKey.lastIndexOf('/'));
      }
    });

    return this.nestedDoc;
  }
  

}
