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
        if (item === this.initialSelectedItem) {
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
