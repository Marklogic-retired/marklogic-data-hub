/* Copyright 2002-2018 MarkLogic Corporation. All Rights Reserved. */

// export for convenience.
export {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet
} from '@angular/router';

import { Component, Directive, Injectable, Input, HostListener, Renderer2, ElementRef } from '@angular/core';
import { NavigationExtras } from '@angular/router';

@Directive({
  selector: '[routerLink]'
})
export class RouterLinkStubDirective {
  constructor(
    private rd: Renderer2,
    private element: ElementRef
  ) {}
  @HostListener('click') onClick() {
    const elements = this.element.nativeElement.parentNode.querySelectorAll('.active');
    elements.forEach(element => {
        this.rd.removeClass(element, 'active');
      });
    this.rd.addClass(this.element.nativeElement, 'active');

  }
}

// @Component({ selector: 'router-outlet', template: '' })
// export class RouterOutletStubComponent {}

// @Injectable()
// export class RouterStub {
//   navigateByUrl(url: string) {
//     return url;
//   }
//   navigate(commands: any[], extras?: NavigationExtras) {}
// }

// Only implements params and part of snapshot.params
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
    return { params: this.testParams };
  }
}