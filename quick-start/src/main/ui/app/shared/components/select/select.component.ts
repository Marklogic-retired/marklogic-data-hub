import { Component, Input, EventEmitter,
  OnInit, OnChanges, Output, ViewChild } from '@angular/core';

import { MdlMenuComponent, MdlButtonComponent } from '@angular-mdl/core';

import * as _ from 'lodash';

@Component({
  selector: 'app-custom-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements OnInit, OnChanges {
  @Input() id: any;
  @Input() items: any;
  @Input() initialSelectedItem: string;
  @Input() labelText: string;
  @Input() label: string;
  @Input() value: string;
  @Input() readOnly: boolean = false;
  @Input() allowRemove: boolean = false;
  @Output() selectedItem = new EventEmitter();

  currentItem: any = null;

  @ViewChild('toggleButton') private buttonChild: MdlButtonComponent;
  @ViewChild(MdlMenuComponent) private menuChild: MdlMenuComponent;

  constructor() {}

  ngOnInit() {
    this.selectInitial();
  }

  selectInitial() {
    if (this.initialSelectedItem && this.items && this.items.length > 0) {
      _.each(this.items, item => {
        if (this.value && item[this.value] === this.initialSelectedItem) {
          this.selectItem(item, true);
        } else if (item === this.initialSelectedItem) {
          this.selectItem(item, true);
        }
      });
    }
  }

  ngOnChanges(changes: any) {
    if (changes.initialSelectedItem) {
      this.selectInitial();
    }
  }

  hasValue(): boolean {
    let value: any = null;
    if (this.currentItem) {
      if (this.value) {
        value = this.currentItem[this.value];
      } else {
        value = this.currentItem;
      }
    }

    return value !== null;
  }

  toggleMenu($event: Event): void {
    this.menuChild.toggle($event, this.buttonChild);
  }

  selectItem(item: any, allowed: boolean): void {
    if (this.isReadOnly() && !allowed) {
      return;
    }

    this.currentItem = item;

    let value: any;
    if (this.value) {
      value = this.currentItem[this.value];
    } else {
      value = this.currentItem;
    }
    this.selectedItem.emit(value);
  }

  getButtonText() {
    if (this.hasValue()) {
      return this.getItemText(this.currentItem);
    } else {
      return this.labelText;
    }
  }

  getItemText(item: any) {
    let resp: any = null;
    if (item) {
      if (this.label) {
        resp = item[this.label];
      } else {
        resp = item;
      }
    }
    return resp;
  }

  getItemClass(item: any): string {
    if (this.currentItem === item) {
      return 'active';
    }

    return '';
  }

  isActive(item: any): boolean {
    return this.currentItem === item;
  }

  isReadOnly(): boolean {
    return this.readOnly;
  }

  getDynClass(): string {
    let clz = '';
    if (this.isReadOnly()) {
      clz = 'readonly';
    }
    return clz;
  }
}
