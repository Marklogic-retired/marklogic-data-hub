import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-trace-viewer',
  template: `
  <app-trace-viewer-ui

  ></app-trace-viewer-ui>
`
})
export class TraceViewerComponent {

  constructor(
    private router: Router
  ) {}

}
