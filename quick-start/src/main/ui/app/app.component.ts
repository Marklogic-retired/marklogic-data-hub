import { Component, ViewEncapsulation,
  ViewContainerRef, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from './auth';

import { ConfirmService } from './confirm';

import { EnvironmentService } from './environment';

import { ProjectService } from './projects/projects.service';

import { STOMPService } from './stomp/stomp.service';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styles: [
    // require('styles/material.scss'),
    // require('@angular2-material/core/style/core.css'),
    // require('@angular2-material/core/overlay/overlay.css'),
    require('./app.style.scss')
  ],
  template: `
    <hub-header *ngIf="canShowHeader()"></hub-header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class App implements OnInit {
  authenticated: boolean = false;

  constructor(
    private auth: AuthService,
    private envService: EnvironmentService,
    private stomp: STOMPService,
    private projectService: ProjectService,
    private confirm: ConfirmService,
    private vcRef: ViewContainerRef,
    private router: Router) {

    confirm.setDefaultViewContainerRef(vcRef);
    // get the auth state and listen for changes
    this.authenticated = auth.isAuthenticated();
    auth.authenticated.subscribe(authenticated => {
      this.authenticated = authenticated;
    });

    this.stomp.configure(window['BASE_URL'] + '/websocket');
    this.stomp.try_connect();
  }

  ngOnInit() {
    if (!(this.projectService.projectId && this.projectService.environment)) {
      this.router.navigate(['login']);
    }
  }

  canShowHeader() {
    return this.authenticated && this.router.url !== '/login' && this.envService.settings;
  }
}
