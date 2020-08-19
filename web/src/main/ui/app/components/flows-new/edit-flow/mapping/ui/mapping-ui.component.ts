import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, ViewChildren, QueryList, ViewEncapsulation } from '@angular/core';
import { Entity } from '../../../../../models/index';
import { MdlDialogService } from '@angular-mdl/core';
import * as _ from 'lodash';
import { Mapping } from "../../../../mappings/mapping.model";
import { EnvironmentService } from '../../../../../services/environment';
import {MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { Step } from '../../../models/step.model';
import { ManageFlowsService } from "../../../services/manage-flows.service";

@Component({
  selector: 'app-mapping-ui',
  templateUrl: './mapping-ui.component.html',
  styleUrls: ['./mapping-ui.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MappingUiComponent implements OnChanges {

  @Input() mapping: Mapping = new Mapping();
  @Input() targetEntity: Entity = null;
  @Input() conns: object = {};
  @Input() sampleDocSrcProps: Array<any>;
  @Input() sampleDocNestedProps: Array<any>;
  @Input() docUris: Array<any>;
  @Input() editURIVal: string = '';
  @Input() step: Step;
  @Input() functionLst: object;
  @Input() entityName: string;
  @Input() entityNested: Entity;
  @Input() xmlSource: boolean;
  @Input() disableURINavLeft: boolean;
  @Input() disableURINavRight: boolean;

  @Input() entityProps: any;
  @Input() nmspace: object;
  @Output() updateURI = new EventEmitter();
  @Output() updateMap = new EventEmitter();

  private connsOrig: object = {};

  public valMaxLen: number = 25;

  public editingURI: boolean = false;
  public isTestClicked: boolean = false;

  displayedColumns = ['key', 'val'];

  // Entity table column menu
  entityTblCols: any = {
    name: { label: 'Name', shown: true },
    datatype: { label: 'Type', shown: true },
    expression: { label: 'Expression', shown: true },
    value: { label: 'Value', shown: true }
  }
  // Convenience for template
  colIds: Array<string> = Object.keys(this.entityTblCols);
  // Show all by default
  colsShown: Array<string> = Object.keys(this.entityTblCols);

  dataSource: MatTableDataSource<any>;
  mapExpresions = {};

  uriIndex = 0;

  @ViewChild(MatTable)
  table: MatTable<any>;

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  @ViewChild(MatSort)
  sort: MatSort;

  @ViewChildren('fieldName') fieldName:QueryList<any>;
  public mapResp: any = {};

  ngOnInit(){
    if (!this.dataSource){
      this.dataSource = new MatTableDataSource<any>(this.sampleDocNestedProps);
    }
    if(_.isEmpty(this.mapExpresions)) {
      this.mapExpresions = this.conns;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  updateDataSource() {
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<any>(this.sampleDocNestedProps);
    }
    this.dataSource.data = this.sampleDocNestedProps;
  }

  renderRows(): void {
    this.updateDataSource();
    if(_.isEmpty(this.mapExpresions)) {
      this.mapExpresions = this.conns;
    }
  }

  getMapValidationResp(sourceURI?: string) {
    let self = this;
    self.isTestClicked = true;
    let uri;

    self.manageFlowsService.getMap(self.mapping.name).subscribe((map: any) => {
      if (sourceURI) {
        uri = sourceURI;
      }
      else {
        uri = map.sourceURI;
      }
      self.manageFlowsService.getMappingValidationResp(map.name, map, uri, this.step.options.sourceDatabase).subscribe(resp => {
        self.mapResp = resp;
      },
        err => {
          if (err.hasOwnProperty('error')) {
            console.log("found error");
            if (err['error']['code'] == 500 && String(err['error']['message']).indexOf("Could not find mapping") >= 0) {
              let result = self.dialogService.alert(
                'QuickStart has not finished loading the updated mapping. Please try again.',
                'OK'
              );
              result.subscribe();
            }
          }
        });
    });
  }


  onClear(){
    this.mapResp = {};
    this.isTestClicked = false;
  }

  onNavigateURIList(index) {
    const end = this.docUris.length - 1;
    // Not at beginning or end of range
    if (index > 0 && index < end) {
      this.disableURINavLeft = false;
      this.disableURINavRight = false;
      this.uriIndex = index;
      this.editURIVal = this.docUris[index];
      this.onUpdateURINewUI();

    } // At beginning of range
    else if (index === 0) {
      this.disableURINavLeft = true;
      if (end > 0) {
        this.disableURINavRight = false;
      }
      this.uriIndex = index;
      this.editURIVal = this.docUris[index];
      this.onUpdateURINewUI();
    } // At end of range
    else if (index === end) {
      if (end > 0) {
        this.disableURINavLeft = false;
      }
      this.disableURINavRight = true;
      this.uriIndex = index;
      this.editURIVal = this.docUris[index];
      this.onUpdateURINewUI();
    } else {
      // Before beginning of range
      if (index < 0) {
        this.disableURINavLeft = true;
      }
      // After end of range
      else {
        this.disableURINavRight = true;
      }
    }
  }

  onUpdateURINewUI (){
    this.editingURI = false;
    this.updateURI.emit({
      uri: this.editURIVal,
      uriOrig: this.mapping.sourceURI,
      conns: this.conns,
      connsOrig: this.connsOrig,
      save: true
    });
    console.log(this.editURIVal);
    if(this.isTestClicked) {
      this.getMapValidationResp(this.editURIVal);
    }
  }

  onUpdateURI() {
    if (Object.keys(this.conns).length > 0) {
      let result = this.dialogService.confirm(
          'Changing your source document will remove<br/>existing property selections. Proceed?',
          'Cancel', 'OK');
      result.subscribe( () => {
          this.conns = {};
          this.editingURI = false;
          this.updateURI.emit({
            uri: this.editURIVal,
            uriOrig: this.mapping.sourceURI,
            conns: this.conns,
            connsOrig: this.connsOrig,
            save: true
          });
        },(err: any) => {
          console.log('source change aborted');
          this.editingURI = false;
        },
        () => {}
      );
    } else {
      this.editingURI = false;
      this.updateURI.emit({
        uri: this.editURIVal,
        uriOrig: this.mapping.sourceURI,
        conns: this.conns,
        connsOrig: {},
        save: true
      });
    }
  }

  /**
   * Cancel the editing of the source document URI.
   */
  cancelEditURI() {
    this.editURIVal = this.mapping.sourceURI;
    this.editingURI = false;
  }

  /**
   * Handle "Enter" keypress for the source document URI box.
   * @param event Event object
   */
  keyPressURI(event) {
    if (event.key === 'Enter') {
      this.onUpdateURINewUI();
    }
  }

  /**
   * Handle when edit URI is not found.
   * @param uri URI not found
   */
  uriNotFound(uri) {
    let result = this.dialogService.alert(
      'No document found. You must ingest source documents',
      'OK'
    );
    result.subscribe( () => {
        this.editURIVal = this.mapping.sourceURI;
        // rollback to conns from previous URI
        if (!_.isEmpty(this.connsOrig)) {
          this.conns = this.connsOrig;
        }
      },
      () => {},
      () => {}
    )
  }

  constructor(
    private dialogService: MdlDialogService,
    private envService: EnvironmentService,
    private manageFlowsService: ManageFlowsService,
    public dialog: MatDialog
  ) {}

  /**
   * Handle changes of component properties.
   * @param changes SimpleChanges object with change information.
   */
  ngOnChanges(changes: SimpleChanges) {
    // Keep values up to date when mapping changes
    if (changes.mapping) {
      this.editURIVal = this.mapping.sourceURI;
    }
    if (changes.conns) {
      this.connsOrig = _.cloneDeep(changes.conns.currentValue);
    }
    if (changes.sampleDocSrcProps){
      this.renderRows();
    }
    if (changes.entityNested && changes.entityNested.currentValue){
      // Get props from target entity for passing to child
      this.entityProps =
        this.entityNested.definitions[this.targetEntity.info.title].properties;
    }
  }

  handleSelection(name, expr, nested): void {
    console.log('mapping-ui handleSelection', name, expr, nested);
    if (nested === true) {
      // New nested version
      this.conns = expr;
    } else {
      // Legacy flat version
      this.conns[name] = expr;
    }
    if (!_.isEqual(this.conns, this.connsOrig)) {
      this.onSaveMap(nested);
    }
  }

  onHandleInput(event): void {
    this.handleSelection(event.name, event.expr, true);
  }


  /**
   * Handle save event by emitting connection object.
   */
  onSaveMap(nested) {
    this.updateMap.emit({
      conns: this.conns,
      nested: nested
    });
    this.connsOrig = _.cloneDeep(this.conns);
  }


  /**
   * Should datatype be displayed with quotes?
   * @param property datatype
   * @returns {boolean}
   */
  isQuoted(type) {
    let typesToQuote = ['string', 'date'];
    return _.indexOf(typesToQuote, type) > -1;
  }

  /**
   * Trim start of long string and add prefix ('...trimmed-string'
   * @param str String to trim
   * @param num Character threshold
   * @param prefix Prefix to add
   * @returns {any} Trimmed string
   */
  getLastChars(str, num, prefix) {
    prefix = prefix ? prefix : '...';
    let result = str;
    if (typeof str === 'string' && str.length > num) {
      result = prefix + str.substr(str.length - num);
    }
    return result;
  }

  getInitialChars(str, num, suffix) {
    suffix = suffix ? suffix : '...';
    let result = str;
    if (typeof str === 'string' && str.length > num) {
      result = str.substr(0, num) + suffix;
    }
    return result;
  }

   /**
    * Return string if sufficiently long, otherwise empty string
    * @param str String to return
    * @param num Character threshold
    * @returns {any} string
    */
   getURITooltip(str, num) {
     let result = '';
     if (typeof str === 'string' && str.length > num) {
       result = str;
     }
     return result;
   }

  OpenFullSourceQuery() {
    let result = this.dialogService.alert(
      this.step.options.sourceQuery,
      'OK'
    );
    result.subscribe();

  }

  //Indenting the nested levels
  IndentCondition(prop) {
    let count = prop.split('/').length - 1;
    let indentSize = 12*count;

    let style = {'text-indent': indentSize+'px'}
  return style
  }

  // Attach namespace, if the source is an xml document
  displaySourceField(field): string {
    let truncField = field.slice(field.lastIndexOf('/')+1).split(':').join(': ');
    return truncField;
  }

  // Handle selection in entity table column menu
  colToggle(id) {
    this.entityTblCols[id].shown = !this.entityTblCols[id].shown;
    this.colsShown = this.colIds.filter(id => {
      return this.entityTblCols[id].shown;
    });
  }

}
