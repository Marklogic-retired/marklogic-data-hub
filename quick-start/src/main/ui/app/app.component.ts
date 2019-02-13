import { Component, ViewEncapsulation,
  ViewContainerRef, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from './services/auth';

import { EnvironmentService } from './services/environment';

import { JobService } from './components/jobs';

import { ProjectService } from './services/projects';

import { STOMPService } from './services/stomp';

import { TraceService } from './components/traces/trace.service';

interface CustomWindow {
  BASE_URL: string;
}
declare var window: CustomWindow;

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  template: `
    <app-ui
      [canShowHeader]="flagCanShowHeader"
      [headerOffset]="flagheaderOffset"
    ></app-ui>
  `
})
export class AppComponent implements OnInit {
  authenticated: boolean = false;
  flagCanShowHeader: boolean = false;
  flagheaderOffset: string = '0px';

  constructor(
    private auth: AuthService,
    private envService: EnvironmentService,
    private jobService: JobService,
    private stomp: STOMPService,
    private projectService: ProjectService,
    private traceService: TraceService,
    private vcRef: ViewContainerRef,
    private router: Router) {

    // get the auth state and listen for changes
    this.authenticated = auth.isAuthenticated();
    auth.authenticated.subscribe((authenticated: boolean) => {
      this.authenticated = authenticated;
    });

    let baseUrl: string = window.BASE_URL;
    this.stomp.configure(baseUrl + '/websocket');
    this.stomp.try_connect();
  }

  ngOnInit() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['login']);
    }
  }

  ngAfterContentChecked() {
    this.flagCanShowHeader = this.canShowHeader();
    this.flagheaderOffset = this.headerOffset();
  }


  canShowHeader(): boolean {
    return (this.authenticated && this.router.url !== '/login' && this.envService.settings !== undefined);
  }

  headerOffset(): string {
    return this.canShowHeader() ? '64px' : '0px';
  }
}
