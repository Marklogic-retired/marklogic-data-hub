import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-select-key-values',
  templateUrl: './select-key-values.component.html',
  styleUrls: ['./select-key-values.component.scss'],
})
export class SelectKeyValuesComponent {
  @Input() title: string;
  @Input() keyLabel: string = "Key";
  @Input() valLabel: string = "Value";
  @Input() keyVals: any;
  @Output() onChange = new EventEmitter<any>();
  @Output() onAdd = new EventEmitter<any>();
  @Output() onRemove = new EventEmitter<any>();

  constructor() {
  }

  add(index): void {
    this.keyVals.push({key:'',val:''});
    this.onAdd.emit({index: index});
  }

  remove(index): void {
    this.keyVals.splice(index, 1);
    this.onRemove.emit({index: index});
  }

}
