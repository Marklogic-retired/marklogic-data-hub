import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, 
  ViewChild, ViewChildren, QueryList, ViewEncapsulation } from '@angular/core';
import { MatTable, MatTableDataSource} from "@angular/material";

@Component({
  selector: 'app-entity-table-ui',
  templateUrl: './entity-table-ui.component.html',
  styleUrls: ['./entity-table-ui.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EntityTableUiComponent implements OnChanges {

  @Input() entityName: any;
  @Input() entityProps: any;
  @Input() showHeader: boolean;
  @Input() nestedLevel: number;
  @Input() srcProps: any;
  @Input() functionLst: object;
  @Output() handleSelection = new EventEmitter();
  
  dataSource: MatTableDataSource<any>;

  columnsToDisplay = ['name', 'datatype', 'expression', 'value'];
  mapExpressions = {};
  mapData = {};
  showProp = {};
  showPropInit = false;

  @ViewChild(MatTable)
  table: MatTable<any>;

  @ViewChildren('fieldName') fieldName:QueryList<any>;

  constructor() {}

  ngOnInit(){
    console.log('ngOnInit');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges', changes);
    if (changes.entityProps && changes.entityProps.currentValue){
      this.dataSource = new MatTableDataSource<any>(changes.entityProps.currentValue);
    }
  }

  getDatatype(prop) {
    if (prop.datatype === 'array') {
      let s = prop.items.$ref.split('/');
      return s.slice(-1).pop() + '[]';
    } else if (prop.$ref !== null) {
      let s = prop.$ref.split('/');
      return s.slice(-1).pop();
    } else {
      return prop.datatype;
    }
  }

  isNested(prop) {
    return prop.datatype === 'array' || prop.$ref !== null;
  }

  onHandleSelection(obj): void {
    if (this.mapData[obj.name] === undefined) {
      this.mapData[obj.name] = {};
    }
    if (typeof obj.expr === 'string') {
      this.mapExpressions[obj.name] = obj.expr;
      this.mapData[obj.name]['sourcedFrom'] = obj.expr;
      if (obj.ref) {
        this.mapData[obj.name]['targetEntityType'] = obj.ref;
      }
    } else {
      this.mapData[obj.name]['properties'] = obj.expr;
    }
    let newObj = {name: this.entityName, expr: this.mapData};
    this.handleSelection.emit(newObj);
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
    f.selectionStart = startPos;
    f.selectionEnd = startPos + content.length;
    f.focus();
    this.onHandleSelection({
      name: prop.name, expr: f.value, 
      ref: prop.$ref, nested: this.isNested(prop)
    });
  }

  insertFunction(functionName, index, prop) {
    this.insertContent(this.functionsDef(functionName), index, prop);
  }

  insertField(fieldName, index, prop) {
    this.insertContent(fieldName, index, prop)
  }

}
