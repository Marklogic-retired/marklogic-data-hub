import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-inline-edit',
  templateUrl: './inline-edit.component.html',
  styleUrls: ['./inline-edit.component.scss']
})
export class InlineEditComponent implements OnInit {

  @Input() key: string;
  @Input() value: any;
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() editing: boolean = false;
  @Output() editingChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  private originalValue: any;

  constructor() { }

  ngOnInit() {
  }

  startEditing() {
    this.originalValue = this.value;
    this.editing = true;
    this.editingChange.emit(true);
  }

  cancelEditing() {
    this.editing = false;
    this.editingChange.emit(false);
    this.value = this.originalValue;
  }

  save() {
    this.editing = false;
    this.editingChange.emit(false);
    this.valueChange.emit(this.value);
  }

}
