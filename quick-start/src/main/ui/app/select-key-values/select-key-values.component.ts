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

  constructor() {
  }

  add(): void {
    this.keyVals.push({key:'',val:''});
  }

  remove(index): void {
    this.keyVals.splice(index, 1);
  }

}
