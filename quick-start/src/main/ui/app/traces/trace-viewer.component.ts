import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TimeAgoPipe } from 'angular2-moment';
import { TraceService } from './trace.service';
import { Trace } from './trace.model';

import { Codemirror } from '../codemirror';

import * as moment from 'moment';

import * as _ from 'lodash';

@Component({
  selector: 'trace-viewer',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './trace-viewer.tpl.html',
  directives: [Codemirror],
  pipes: [TimeAgoPipe],
  providers: [TraceService],
  styleUrls: [
    './trace-viewer.style.scss',
    '../../../../../node_modules/codemirror/lib/codemirror.css'
  ],
})
export class TraceViewer implements OnInit, OnDestroy {

  private sub: any;
  private trace: Trace;
  private plugins: Array<string>;

  private currentPluginType: string;
  private currentPlugin: Plugin;

  private collapsed = {};
  private outputCollapsed = false;
  private errorCollapsed = false

  private codeMirrorConfig = {
    lineNumbers: true,
    indentWithTabs: true,
    lineWrapping: true,
    readOnly: true,
    cursorBlinkRate: 0
  };

  constructor(
    private route: ActivatedRoute,
    private traceService: TraceService
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
     let id = params['id'];
     console.log('id: ' + id);
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

  private setCurrent(type) {
    this.currentPluginType = type;
    this.currentPlugin = this.trace[type + 'Plugin'];
  }

  private getKeys(thing) {
    return _.keys(thing).sort();
  }

  private formatData(data) {
    if (_.isObject(data) || _.isArray(data)) {
      return JSON.stringify(data, null, '  ');
    }
    return data;
  }
}
