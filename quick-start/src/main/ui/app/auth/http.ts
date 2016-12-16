import {
  Http, Request, RequestOptionsArgs, Response,
  RequestOptions, ConnectionBackend, Headers,
  URLSearchParams, XHRBackend
} from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import * as _ from 'lodash';

class HttpInterceptor extends Http {
  constructor(
    backend: ConnectionBackend,
    defaultOptions: RequestOptions,
    private _router: Router,
    private auth: AuthService) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.request(url, options));
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    /* cache busting for IE */
    if (!options) {
      options = {};
    }
    options.search = options.search || new URLSearchParams();
    if (options.search instanceof URLSearchParams) {
      options.search.set('_ts', (new Date()).getTime().toString());
    } else {
      options.search += `&_ts=${(new Date()).getTime()}`;
    }
    /* end cache busting for IE */
    return this.intercept(super.get(url, options));
  }

  post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
  }

  put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.delete(url, options));
  }

  getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
    if (options == null) {
      options = new RequestOptions();
    }
    if (options.headers == null) {
      options.headers = new Headers();
    }
    options.headers.append('Content-Type', 'application/json');
    return options;
  }

  intercept(observable: Observable<Response>): Observable<Response> {
    return observable.catch((err, source) => {
      if (err.status  === 401 && !_.endsWith(err.url, '/login') && !_.endsWith(this._router.routerState.snapshot.url, '/login')) {
          this.auth.redirectUrl = this._router.routerState.snapshot.url;
          this._router.navigate(['login']);
          return Observable.empty();
        } else {
          return Observable.throw(err);
      }
    });

  }
}

export const HTTP_PROVIDER = {
  provide: Http,
  useFactory: (
    xhrBackend: XHRBackend,
    requestOptions: RequestOptions,
    router: Router,
    auth: AuthService
  ) => new HttpInterceptor(xhrBackend, requestOptions, router, auth),
  deps: [XHRBackend, RequestOptions, Router, AuthService]
 };
