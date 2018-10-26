import { Component, ViewEncapsulation,
  ViewContainerRef, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from './auth';

import { EnvironmentService } from './environment';

import { JobService } from './shared/services/jobs';

import { ProjectService } from './shared/services/projects';

import { STOMPService } from './shared/services/stomp';

import { TraceService } from './traces/trace.service';

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
  styleUrls: [
    './app.component.scss'
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  authenticated: boolean = false;

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

  canShowHeader() {
    return this.authenticated && this.router.url !== '/login' && this.envService.settings;
  }

  headerOffset(): string {
    return this.canShowHeader() ? '64px' : '0px';
  }
}
