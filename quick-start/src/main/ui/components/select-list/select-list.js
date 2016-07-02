import {Component, Input, Output, Inject, EventEmitter} from 'ng-forward';

import * as _ from 'lodash';

import template from './select-list.html';
import './select-list.scss';

@Component({
  selector: 'select-list',
  template,
  inputs: ['items', 'selected', 'label', 'identifier', 'readOnly'],
})
@Inject('$scope')
/**
 * @ngdoc directive
 * @name select-list
 * @restrict E
 *
 */
export class SelectList {
  @Output() selectedItem = new EventEmitter();

  currentItem = null;
  constructor($scope) {
    this.$scope = $scope;

    this.$scope.$watch('ctrl.items', () => {
      if (this.selected && this.items && this.items.length > 0) {
        _.each(this.items, item => {
          if (item === this.selected) {
            this.selectItem(item, true);
          }
        });
      }
    });
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
    this.selectedItem.next(value);
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
    return (this.readOnly === true || this.readOnly === 'true');
  }

  getDynClass() {
    let clz = '';
    if (this.isReadOnly()) {
      clz = 'readonly';
    }
    return clz;
  }
}
