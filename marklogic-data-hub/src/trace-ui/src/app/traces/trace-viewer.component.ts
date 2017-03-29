import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TraceService } from './trace.service';
import { Trace } from './trace.model';

import * as _ from 'lodash';

@Component({
  selector: 'app-trace-viewer',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './trace-viewer.tpl.html',
  providers: [TraceService],
  styleUrls: [
    './trace-viewer.style.scss'
  ],
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
    return data;
  }

  getButtonClasses(plugin) {
    let classes = [];
    if (this.currentPluginType === plugin) {
      classes.push('active');
    }

    if (this.trace[plugin + 'Plugin'].error) {
      classes.push('error');
    }
    return classes.join(' ');
  }

  private setCurrent(type: string) {
    this.currentPluginType = type;
    this.currentPlugin = this.trace[type + 'Plugin'];
  }
}
