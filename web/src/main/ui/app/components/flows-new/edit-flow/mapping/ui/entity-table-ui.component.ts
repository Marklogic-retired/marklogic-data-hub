import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges,
  ViewChild, ViewChildren, QueryList, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatTable, MatTableDataSource} from "@angular/material";
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-entity-table-ui',
  templateUrl: './entity-table-ui.component.html',
  styleUrls: ['./entity-table-ui.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EntityTableUiComponent implements OnChanges {

  @Input() entityName: any;
  @Input() entityProps: any;
  @Input() mapProps: any;
  @Input() context: string;
  @Input() colsShown: Array<string>;
  @Input() showHeader: boolean; // Hide table header for nested
  @Input() nestedLevel: number; // For indenting
  @Input() srcProps: any;
  @Input() functionLst: object;
  @Input() nmspace: object;
  @Input() mapResults: any;
  @Input() currEntity:string;
  @Input() mapErrors: any;
  @Input() containErrors: boolean;
  @Output() handleInput = new EventEmitter();

  dataSource: MatTableDataSource<any>;

  // Mapping data
  mapExpressions = {}; // for UI
  mapData = {}; // for saved artifact
  mapExp = new FormControl('');
  // Show/hide nested property table
  showProp = {};
  showPropInit = false;

  @ViewChild(MatTable)
  table: MatTable<any>;

  @ViewChildren('fieldName') fieldName:QueryList<any>;

  constructor(
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.entityProps && changes.entityProps.currentValue){
      this.dataSource = new MatTableDataSource<any>(changes.entityProps.currentValue);
    }
    if (changes.mapProps && changes.mapProps.currentValue){
      Object.keys(this.mapProps).forEach(p => {
        this.mapExpressions[p] = this.mapProps[p]['sourcedFrom'];
      })
      this.mapData = this.mapProps;
    }
    if (changes.colsShown && changes.colsShown.currentValue){
      this.colsShown = changes.colsShown.currentValue;
    }
  }

  displayErrorMessage(propName) { 
    let field = this.mapErrors["properties"]
    if (field[propName] && field[propName]["errorMessage"]) {
      return field[propName]["errorMessage"];
    }
  }

  checkFieldInErrors(field){
    if(this.mapErrors && this.mapErrors['properties']){
      if(this.mapErrors['properties'][field] && this.mapErrors['properties'][field]['errorMessage']) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getDatatype(prop) {
    if (prop.datatype === 'array') {
      if (prop.items && prop.items.$ref) {
        let s = prop.items.$ref.split('/');
        return s.slice(-1).pop() + '[]';
      } else if (prop.items && prop.items.datatype) {
        return prop.items.datatype + '[]';
      }
    } else if (prop.$ref !== null) {
      let s = prop.$ref.split('/');
      return s.slice(-1).pop();
    } else {
      return prop.datatype;
    }
    return null;
  }
  getValue(prop) {
    if (this.mapResults) {
      if (! ((prop.$ref || (prop.items && prop.items.$ref)))) {
        let parseRes = this.mapResults;
        if (Array.isArray(this.mapResults)) {
          parseRes = parseRes[0];
        }
        if (this.currEntity) {
          const entity = this.currEntity.slice(this.currEntity.lastIndexOf('/') + 1);
          parseRes = parseRes[entity];
        }
        return parseRes ? parseRes[prop.name] : null;
      }
    }
  }

  getProps(propName) {
    return (this.mapProps && this.mapProps[propName] && this.mapProps[propName].properties) ?
      this.mapProps[propName].properties : null;
  }

  getResults(propName) {
    return (this.mapResults && this.mapResults[propName]) ?
      this.mapResults[propName] : null;
  }

  getContext(propName) {
    let result = null;
    if (this.mapExpressions && this.mapExpressions[propName]) {
      result = '';
      // Concat to current context from parent if present
      if (this.context) {
        result = this.context;
        // Add trailing '/' if not already there
        if (this.context[this.context.length-1] !== '/') {
          result = result + '/';
        }
      }
      result = result + this.mapExpressions[propName];
    }
    return result;
  }

  isNested(prop) {
    const propRef = prop.$ref  || (prop.items && prop.items.$ref);
    return propRef && this.isInternalRef(propRef);
  }

  isInternalRef(propRef) {
    return propRef && propRef.startsWith('#/definitions/');
  }

  hasExternalRef(prop) {
    const propRef = prop.$ref || (prop.items && prop.items.$ref) || null;
    return propRef && this.isExternalRef(propRef);
  }

  isExternalRef(propRef) {
    return propRef && !propRef.startsWith('#/definitions/');
  }

  onHandleInput(obj): void {
    let propRef = obj.prop.$ref || (obj.prop.items && obj.prop.items.$ref) || null;
    if (this.mapData[obj.name] === undefined) {
      this.mapData[obj.name] = {};
    }
    if (typeof obj.expr === 'string') {
      this.mapExpressions[obj.name] = obj.expr;
      this.mapData[obj.name]['sourcedFrom'] = obj.expr;
      if (propRef) {
        this.mapData[obj.name]['targetEntityType'] = propRef;
      }
      this.cd.detectChanges(); // Required for context updates
    } else {
      this.mapData[obj.name]['properties'] = obj.expr;
    }
    let newObj = {name: this.entityName, expr: this.mapData, prop: obj.prop};
    this.handleInput.emit(newObj);
  }

  toggleProp(name) {
    if(typeof this.showProp[name] === 'undefined') {
      this.showProp[name] = !this.showPropInit;
    } else {
      this.showProp[name] = !this.showProp[name];
    }
  }

  counter(i: number) {
      return new Array(i);
  }

  executeFunctions(funcName, propName) {
    this.mapExpressions[propName] = this.mapExpressions[propName] + " " + this.functionsDef(funcName);
    console.log(funcName, propName, this.mapExpressions[propName])
  }

  functionsDef(funcName) {
    return this.functionLst[funcName].signature
  }

  insertContent(content, index, prop) {
    const f = this.fieldName.toArray()[index].nativeElement;
    const startPos = f.selectionStart;
    f.focus();
    f.value = f.value.substr(0, f.selectionStart) + content +
      f.value.substr(f.selectionStart, f.value.length);
    //f.selectionStart = startPos;
    //f.selectionEnd = startPos+content.length;
    f.focus();
    this.onHandleInput({ 
      name: prop.name, 
      expr: f.value, 
      prop: prop
    });
  }

  insertFunction(functionName, index, prop) {
    this.insertContent(this.functionsDef(functionName), index, prop);
  }

  insertField(fieldName, index, prop) {
    if(String(fieldName).includes(" ")){
      fieldName = "*[local-name(.)='" + fieldName + "']";
    }
    // Trim context from beginning of fieldName if needed
    if (this.context) {
      let len = this.context.length;
      if (fieldName.substring(0, len+1) === this.context + '/') {
        fieldName = fieldName.slice(len+1);
      }
    }
    this.insertContent(fieldName, index, prop)
  }

  //Indenting the nested levels
  IndentCondition(prop) {
    let count = prop.split('/').length - 1;
    let indentSize = 20*count;

    let style = {'text-indent': indentSize+'px'}
  return style
  }

  // Removing duplicate entries in the source dataset
  uniqueSourceFields(source) {
    let uniqueSrcFields = [];
    source.forEach(obj => {
      if(obj.key.slice(obj.key.lastIndexOf('/')+1) != ""){
        uniqueSrcFields.push(obj.key);
      }
    });

    return uniqueSrcFields.filter((item, index) => uniqueSrcFields.indexOf(item) === index);
  }

  // Attach namespace, if the source is an xml document
  displaySourceField(field): string {
    let fieldValue = "";
    let truncField = field.slice(field.lastIndexOf('/')+1);
    if(this.nmspace && truncField in this.nmspace) {
      fieldValue = this.nmspace[truncField].slice(this.nmspace[truncField].lastIndexOf('/')+1) + ": "+ truncField;
    }
    else {
      fieldValue = truncField;
    }
    return fieldValue;
  }

}
