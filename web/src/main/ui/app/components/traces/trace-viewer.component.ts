import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


import { TraceService } from './trace.service';
import { Trace } from './trace.model';
@Component({
  selector: 'app-trace-viewer',
  template: `
  <app-trace-viewer-ui
    [trace]="trace"
    [currentPluginType]="currentPluginType"
    [currentPlugin]="currentPlugin"
    [collapsed]="collapsed"
    [outputCollapsed]="outputCollapsed"
    [errorCollapsed]="errorCollapsed"
    [codeMirrorConfig]="codeMirrorConfig"
    (setCurrent)="this.setCurrent($event)"
  ></app-trace-viewer-ui>
`
})
export class TraceViewerComponent implements OnInit, OnDestroy {
  private sub: any;
  public trace: Trace;

  public currentPluginType: string;
  public currentPlugin: Plugin;
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

  public setCurrent(plugin: any) {
    this.currentPluginType = plugin.label;
    this.currentPlugin = plugin;
  }
}
