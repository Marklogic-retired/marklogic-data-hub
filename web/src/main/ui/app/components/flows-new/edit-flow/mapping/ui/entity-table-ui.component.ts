import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, 
  ViewChild, ViewChildren, QueryList, ViewEncapsulation } from '@angular/core';
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
  @Input() colsShown: Array<string>;
  @Input() showHeader: boolean; // Hide table header for nested
  @Input() nestedLevel: number; // For indenting
  @Input() srcProps: any;
  @Input() functionLst: object;
  @Input() nmspace: object;
  @Input() mapResults: any;
  @Input() currEntity:string;
  @Input() displayErrors: boolean;
  @Input() errorsAvailable: boolean;
  @Input() mapValidationResult: object;
  @Output() handleSelection = new EventEmitter();
  
  dataSource: MatTableDataSource<any>;

  // Mapping data
  mapExpressions = {}; // for UI
  mapData = {}; // for saved artifact
  mapExp = new FormControl('');
  // Show/hide nested property table
  showProp = {};
  showPropInit = false;
  // displayErrors = false;
  // errorsAvailable = false;

  @ViewChild(MatTable)
  table: MatTable<any>;

  @ViewChildren('fieldName') fieldName:QueryList<any>;

  constructor() {}

  ngOnInit() {}

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
    console.log("mapExpressions",this.mapExp);
  }

//  validateMapping(fc: FormControl) {
//     let EMAIL_REGEXP = ...
  
//     return EMAIL_REGEXP.test(c.value) ? null : {
//       validateEmail: {
//         valid: false
//       }
//     };
//   }

  showError(){
    if (this.displayErrors == true ) {
      this.displayErrors = false
    }
    else {
      if (this.errorsAvailable == true){
        this.displayErrors = true;
      }
    }
    
  }
  getErrorMessage(propName) { 
    //this.mapExp.markAsTouched();
    if(this.errorsAvailable == true) {
      this.errorsAvailable = false;
    }
    else {
      let field = this.mapValidationResult["properties"]
    console.log("this is being called",field[propName], this.mapExpressions[propName])
    if (field[propName] && field[propName]["errorMessage"]) {
      //console.log("field[this.mapExpressions[propName]]",field[this.mapExpressions[propName]])
      this.errorsAvailable = true;
    }
  } 
      
    // } else {
    //   this.displayErrors = false;
    // }
    // return this.mapExp.hasError('required') ? 'You must enter a value' :
    //     this.mapExp.hasError('email') ? 'Not a valid email' :
    //         '';
  
}

  displayErrorMessage(propName) { 
    
    let field = this.mapValidationResult["properties"]
    if (field[propName] && field[propName]["errorMessage"]) {
      return field[propName]["errorMessage"]
    // return this.mapExp.hasError('required') ? 'You must enter a value' :
    //     this.mapExp.hasError('email') ? 'Not a valid email' :
    //         '';
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
      return parseRes[prop.name];
    }
  }
}

  getProps(propName) {
    return (this.mapProps[propName] && this.mapProps[propName].properties) ?
      this.mapProps[propName].properties : null;
  }

  isNested(prop) {
    return prop.datatype === 'array' || prop.$ref !== null;
  }

  onHandleSelection(obj): void {
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
    } else {
      this.mapData[obj.name]['properties'] = obj.expr;
    }
    let newObj = {name: this.entityName, expr: this.mapData, prop: obj.prop};
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
    this.onHandleSelection({ name: prop.name, expr: f.value, prop: prop });
  }

  insertFunction(functionName, index, prop) {
    this.insertContent(this.functionsDef(functionName), index, prop);
  }

  insertField(fieldName, index, prop) {
    if(String(fieldName).includes(" ")){
      fieldName = "*[local-name(.)='" + fieldName + "']";
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
      uniqueSrcFields.push(obj.key);
    });
    
    return uniqueSrcFields.filter((item, index) => uniqueSrcFields.indexOf(item) === index);
  }

  // Attach namespace, if the source is an xml document
  displaySourceField(field): string {
    let fieldValue = "";
    if(this.nmspace && field in this.nmspace) {
      fieldValue = this.nmspace[field] + ":"+ field.split('/').pop();
    }
    else {
      fieldValue = field.split('/').pop();
    }
    return fieldValue;
  }

}
