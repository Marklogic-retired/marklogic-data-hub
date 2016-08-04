import { Component, Input, EventEmitter, OnInit, Output,
  ElementRef, ViewChild } from '@angular/core';

import { MdlMenuComponent, MdlButtonComponent } from 'angular2-mdl';

import * as _ from 'lodash';

@Component({
  selector: 'custom-select',
  templateUrl: './select.html',
  styleUrls: ['./select.scss'],
})
export class Select implements OnInit {
  @Input() id: any;
  @Input() items: any;
  @Input() initialSelectedItem: string;
  @Input() labelText: string;
  @Input() label: string;
  @Input() value: string;
  @Input() readOnly: boolean = false;
  @Input() allowRemove: boolean = false;
  @Output() selectedItem = new EventEmitter();

  currentItem = null;

  @ViewChild(MdlButtonComponent) private buttonChild: MdlButtonComponent;
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

  ngOnChanges(changes) {
    if (changes.initialSelectedItem) {
      this.selectInitial();
    }
  }

  toggleMenu($event) {
    this.menuChild.toggle($event, this.buttonChild);
  }

  selectItem(item, allowed) {
    if (this.isReadOnly() && !allowed) {
      return;
    }

    this.currentItem = item;

    let value;
    if (this.value) {
      value = this.currentItem[this.value];
    } else {
      value = this.currentItem;
    }
    this.selectedItem.emit(value);
  }

  getItemText(item) {
    let resp = null;
    if (item) {
      if (this.label) {
        resp = item[this.label];
      } else {
        resp = item;
      }
    }
    return resp;
  }

  getItemClass(item) {
    if (this.currentItem === item) {
      return 'active';
    }

    return '';
  }

  isActive(item) {
    return this.currentItem === item;
  }

  isReadOnly() {
    return this.readOnly;
  }

  getDynClass() {
    let clz = '';
    if (this.isReadOnly()) {
      clz = 'readonly';
    }
    return clz;
  }
}
