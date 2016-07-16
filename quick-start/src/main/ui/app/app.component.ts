/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation,
  ViewContainerRef, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from './auth';

import { ConfirmService } from './confirm';

import { EntitiesService } from './entities/entities.service';

import { InstallService } from './installer';

import { ProjectService } from './projects/projects.service';

import { Header } from './header/header.component';

import { SettingsService } from './settings/settings.service';

import { STOMPService } from './stomp/stomp.service';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  providers: [
    AuthService,
    ConfirmService,
    EntitiesService,
    InstallService,
    ProjectService,
    SettingsService,
    STOMPService
  ],
  directives: [Header],
  styles: [
    require('./app.style.scss')
  ],
  template: `
    <header *ngIf="canShowHeader()"></header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class App implements OnInit {
  authenticated: boolean = false;

  constructor(
    private auth: AuthService,
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

    this.stomp.configure('/websocket');
    this.stomp.try_connect();
  }

  ngOnInit() {
    this.projectService.currentProject().subscribe(() => {
      this.auth.setAuthenticated(true);
    });

  }

  canShowHeader() {
    return this.authenticated && this.router.url !== '/login';
  }
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
