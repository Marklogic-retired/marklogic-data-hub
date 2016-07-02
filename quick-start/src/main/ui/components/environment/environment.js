import {Component, Input, Inject, EventEmitter, Output} from 'ng-forward';

import template from './environment.html';
import './environment.scss';

@Component({
  selector: 'environment-chooser',
  template,
  inputs: ['environments'],
})
@Inject('$scope')
/**
 * @ngdoc directive
 * @name environment
 * @restrict E
 *
 * @param message
 */
export class EnvironmentChooser {
  @Output() environmentChanged = new EventEmitter();

  constructor($scope) {
    $scope.$watch('ctrl.environment', () => {
      if (this.environment) {
        this.environmentChanged.next(this.environment);
      }
    });
  }
}
