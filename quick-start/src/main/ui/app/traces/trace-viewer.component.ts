import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TraceService } from './trace.service';
import { Trace } from './trace.model';

import * as _ from 'lodash';

@Component({
  selector: 'app-trace-viewer',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './trace-viewer.component.html',
  styleUrls: ['./trace-viewer.component.scss'],
})
export class TraceViewerComponent implements OnInit, OnDestroy {

  collapsed = {};
  outputCollapsed = false;
  errorCollapsed = false;
  codeMirrorConfig = {
    lineNumbers: true,
    indentWithTabs: true,
    lineWrapping: true,
    readOnly: true,
    cursorBlinkRate: 0
  };

  private sub: any;
  public trace: Trace;
  private plugins: Array<string>;

  private currentPluginType: string;
  public currentPlugin: Plugin;

  constructor(
    private route: ActivatedRoute,
    private traceService: TraceService
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      let id = params['id'];
      this.traceService.getTrace(id).subscribe(trace => {
        this.trace = trace;
        this.setCurrent(this.trace.steps[0]);
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getKeys(thing: any) {
    return _.keys(thing).sort();
  }

  formatData(data: any) {
    if (_.isObject(data) || _.isArray(data)) {
      return JSON.stringify(data, null, '  ');
    }
    return JSON.stringify(JSON.parse(data), null, '  ');
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

  private setCurrent(plugin: any) {
    this.currentPluginType = plugin.label;
    this.currentPlugin = plugin;
  }
}
