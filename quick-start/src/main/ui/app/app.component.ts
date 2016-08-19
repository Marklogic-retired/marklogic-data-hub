import { Component, ViewEncapsulation,
  ViewContainerRef, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from './auth/index';

import { ConfirmService } from './confirm/index';

import { EnvironmentService } from './environment/index';

import { ProjectService } from './projects/projects.service';

import { STOMPService } from './stomp/stomp.service';

interface CustomWindow {
  BASE_URL: string;
}
declare var window: CustomWindow;

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.style.css'
  ],
  template: `
    <hub-header *ngIf="canShowHeader()"></hub-header>
    <div class="main" [ngStyle]="{'top': headerOffset() }">
      <router-outlet></router-outlet>
    </div>
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
    auth.authenticated.subscribe((authenticated: boolean) => {
      this.authenticated = authenticated;
    });

    let baseUrl: string = window.BASE_URL;
    this.stomp.configure(baseUrl + '/websocket');
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

  headerOffset(): string {
    return this.canShowHeader() ? '64px' : '0px';
  }
}
