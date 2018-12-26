import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

import { MdlDialogService } from '@angular-mdl/core';

import * as _ from 'lodash';

@Component({
  selector: 'app-select-list',
  templateUrl: './select-list.component.html',
  styleUrls: ['./select-list.component.scss'],
})

/**
 * @ngdoc directive
 * @name select-list
 * @restrict E
 *
 */
export class SelectListComponent implements OnInit, OnChanges {
  @Input() items: any;
  @Input() initialSelectedItem: string;
  @Input() label: string;
  @Input() identifier: string;
  @Input() readOnly: boolean = false;
  @Input() allowRemove: boolean = false;
  @Output() selectedItem = new EventEmitter();
  @Output() removedItem = new EventEmitter();

  currentItem: any = null;
  constructor(private dialogService: MdlDialogService) {}

  ngOnInit() {
    this.selectInitial();
  }

  selectInitial() {
    if (this.initialSelectedItem && this.items && this.items.length > 0) {
      _.each(this.items, item => {
        if (this.areItemsEqual(item, this.initialSelectedItem)) {
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

  selectItem(item: any, allowed: boolean): void {
    if (this.isReadOnly() && !allowed) {
      return;
    }

    this.currentItem = item;

    let value: any;
    if (this.identifier) {
      value = this.currentItem[this.identifier];
    } else {
      value = this.currentItem;
    }
    this.selectedItem.emit(value);
  }

  removeItem(item: any, event: Event): void {
    const message = 'Remove the project from the list of projects? Will not remove any project data on disk.';
    this.dialogService.confirm(message, 'Cancel', 'Remove').subscribe(() => {
      this.removedItem.emit({
        item: item,
        event: event
      });
      if (event) {
        event.stopPropagation();
      }
    },
    () => {});
  }

  getItemText(item: any) {
    let resp: any;
    if (this.label) {
      resp = item[this.label];
    } else {
      resp = item;
    }
    return resp;
  }

  getItemClass(item: any): string {
    return (this.isActive(item)) ? 'active' : '';
  }

  isActive(item: any): boolean {
    if (!this.currentItem)
      return false;
    return this.areItemsEqual(this.currentItem, item);
  }

  areItemsEqual(item1: any, item2: any): boolean {
    return (this.label) ?
      (item1[this.label] === item2[this.label]) :
      (item1 === item2);
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
