import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'select-list',
  templateUrl: './select-list.tpl.html',
  inputs: ['items', 'selected', 'label', 'identifier', 'readOnly'],
  styleUrls: ['./select-list.styles.scss'],
})

/**
 * @ngdoc directive
 * @name select-list
 * @restrict E
 *
 */
export class SelectList implements OnInit, OnChanges {
  @Input() items: any;
  @Input() initialSelectedItem: string;
  @Input() label: string;
  @Input() identifier: string;
  @Input() readOnly: boolean = false;
  @Input() allowRemove: boolean = false;
  @Output() selectedItem = new EventEmitter();
  @Output() removedItem = new EventEmitter();

  currentItem = null;
  constructor() {}

  ngOnInit() {
    this.selectInitial();
  }

  selectInitial() {
    if (this.initialSelectedItem && this.items && this.items.length > 0) {
      _.each(this.items, item => {
        if (item === this.initialSelectedItem) {
          this.selectItem(item, true);
        }
      });
    }
  }

  ngOnChanges(changes) {
    console.log(changes);
    if (changes.initialSelectedItem) {
      this.selectInitial();
    }
  }

  selectItem(item, allowed) {
    if (this.isReadOnly() && !allowed) {
      return;
    }

    this.currentItem = item;

    let value;
    if (this.identifier) {
      value = this.currentItem[this.identifier];
    } else {
      value = this.currentItem;
    }
    this.selectedItem.emit(value);
  }

  removeItem(item) {
    this.removedItem.emit(item);
  }

  getItemText(item) {
    let resp;
    if (this.label) {
      resp = item[this.label];
    } else {
      resp = item;
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
