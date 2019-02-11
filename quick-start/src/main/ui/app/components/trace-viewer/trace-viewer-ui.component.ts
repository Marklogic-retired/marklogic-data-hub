import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TraceService } from '../traces/trace.service';
import { Trace } from '../traces/trace.model';

import * as _ from 'lodash';

@Component({
  selector: 'app-trace-viewer-ui',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './trace-viewer-ui.component.html',
  styleUrls: ['./trace-viewer-ui.component.scss'],
})
export class TraceViewerUiComponent {

  @Input() trace: any;
  @Input() sub: any;
  @Input() collapsed: any;
  @Input() outputCollapsed: boolean;
  @Input() errorCollapsed: boolean;
  @Input() codeMirrorConfig: any;
  @Input() currentPluginType: string;
  @Input() currentPlugin: Plugin;

  @Output() setCurrent = new EventEmitter();
  constructor(

  ) {}

  getKeys(thing: any) {
    return _.keys(thing).sort();
  }

  formatData(data: any) {
    if (_.isObject(data) || _.isArray(data)) {
      return JSON.stringify(data, null, '  ');
    }
    try {
      return JSON.stringify(JSON.parse(data), null, '  ');
     } catch(e) {
      return data;
     }
  }

  getButtonClasses(plugin) {
    let classes = [];
    if (this.currentPluginType === plugin) {
      classes.push('active');
    }

    if (plugin.error) {
      classes.push('error');
    }
    return classes.join(' ');
  }
}
