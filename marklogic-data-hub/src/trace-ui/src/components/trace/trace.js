import {Component, Input, Inject} from 'ng-forward';
import {TraceService} from '../../services/traceService';

import template from './trace.html';
import './trace.scss';

@Component({
  selector: 'trace',
  template,
  providers: [TraceService],
})
@Inject('$stateParams', '$rootScope', TraceService)
/**
 * @ngdoc directive
 * @name trace
 * @restrict E
 *
 * @param message
 */
export class Trace {
  codeMirrorConfig = {
    lineNumbers: true,
    indentWithTabs: true,
    lineWrapping: true,
    readOnly: true,
    cursorBlinkRate: 0,
    mode: 'xml',
  };

  plugins = [];

  constructor($stateParams, $rootScope, traceService) {
    this.traceService = traceService;
    this.$rootScope = $rootScope;
    this.identifier = $stateParams.id;
    this.title = 'Trace ' + $stateParams.id;
    this.traceService.getTrace(this.identifier).then(resp => {
      this.trace = resp.data;
      this.$rootScope.$broadcast('$titleChange', 'Trace for identifier: ' + this.trace.identifier);
      this.plugins = [
        'content',
        'headers',
        'triples',
        'writer',
      ];
      if (this.trace.flowType === 'harmonize') {
        this.plugins.unshift('collector');
        this.setCurrent('collector');
      }
      else {
        this.setCurrent('content');
      }
    });
  }

  setCurrent(type) {
    this.currentPluginType = type;
    this.currentPlugin = this.trace[type + 'Plugin'];
  }
}
