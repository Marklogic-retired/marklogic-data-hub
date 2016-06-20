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
      const plugins = [
        'collector',
        'content',
        'headers',
        'triples',
        'writer',
      ];
      this.plugins = [];
      for (let i = 0; i < plugins.length; i++) {
        const pt = plugins[i] + 'Plugin';
        if (this.trace[pt]) {
          this.plugins.push(plugins[i]);
        }
      }

      this.setCurrent(this.plugins[0]);
    });
  }

  setCurrent(type) {
    this.currentPluginType = type;
    this.currentPlugin = this.trace[type + 'Plugin'];
  }
}
