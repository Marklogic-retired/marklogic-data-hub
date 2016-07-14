/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';

import { AuthService } from './auth/auth.service';

import { Header } from './header/header.component';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  providers: [AuthService],
  directives: [Header],
  styles: [
    require('./app.style.scss')
  ],
  template: `
    <header *ngIf="authenticated"></header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class App {
  authenticated: boolean = false;

  constructor(private auth: AuthService) {
    auth.authenticated.subscribe(authenticated => {
      this.authenticated = authenticated;
    });
  }
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
