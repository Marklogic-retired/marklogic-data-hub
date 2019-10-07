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

  @Input() entityProps: any;
  @Input() showHeader: boolean;
  @Input() nestedLevel: number;
  @Input() srcProps: any;
  @Input() functionLst: object;
  @Output() handleSelection = new EventEmitter();
  
  dataSource: MatTableDataSource<any>;

  columnsToDisplay = ['name', 'datatype', 'expression', 'value'];
  mapExpressions = {};
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
    console.log('handleSelection', obj);
    this.handleSelection.emit(obj);
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

  insertContent(content, index, propName) {
    const f = this.fieldName.toArray()[index].nativeElement;
    const startPos = f.selectionStart;
    f.focus();
    f.value = f.value.substr(0, f.selectionStart) + content + 
      f.value.substr(f.selectionStart, f.value.length);
    f.selectionStart = startPos;
    f.selectionEnd = startPos + content.length;
    f.focus();
    this.onHandleSelection({name: propName, expr: f.value});
  }

  insertFunction(functionName, index, propName) {
    this.insertContent(this.functionsDef(functionName), index, propName);
  }

  insertField(fieldName, index, propName) {
    this.insertContent(fieldName, index, propName)
  }

}
