/* Copyright 2002-2018 MarkLogic Corporation. All Rights Reserved. */

// export for convenience.
export {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet
} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {Component, Directive, Injectable, Input} from '@angular/core';
import {NavigationExtras} from '@angular/router';

@Directive({
  selector: '[routerLink]',
  host: {
    '(click)': 'onClick()'
  }
})
export class RouterLinkStubDirective {
  @Input('routerLink') linkParams: any;
  navigatedTo: any = null;

  onClick() {
    this.navigatedTo = this.linkParams;
  }
}

@Component({selector: 'router-outlet', template: ''})
export class RouterOutletStubComponent {
}

@Injectable()
export class RouterStub {
  navigateByUrl(url: string) {
    return url;
  }

  navigate(commands: any[], extras?: NavigationExtras) {
  }
}

@Injectable()
export class ActivatedRouteStub {
  // ActivatedRoute.params is Observable
  private subject = new BehaviorSubject(this.testParams);
  params = this.subject.asObservable();

  // Test parameters
  private _testParams: {};
  get testParams() {
    return this._testParams;
  }

  set testParams(params: {}) {
    this._testParams = params;
    this.subject.next(params);
  }

  // ActivatedRoute.snapshot.params
  get snapshot() {
    return {params: this.testParams};
  }
}
