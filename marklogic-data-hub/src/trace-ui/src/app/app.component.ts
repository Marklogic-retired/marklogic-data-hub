import { Component, ViewEncapsulation, OnInit } from '@angular/core';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.style.scss'
  ],
  template: `
    <app-header></app-header>
    <div class="main">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent implements OnInit {
  authenticated: boolean = false;

  constructor() {
  }

  ngOnInit() {}
}
