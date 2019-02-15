import {
  ConnectionBackend,
  Headers,
  Http,
  Request,
  RequestOptions,
  RequestOptionsArgs,
  Response,
  XHRBackend
} from '@angular/http';
import {Router} from '@angular/router';
import {throwError as observableThrowError, empty as observableEmpty, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';

import * as _ from 'lodash';

class HttpInterceptor extends Http {
  constructor(
    backend: ConnectionBackend,
    defaultOptions: RequestOptions,
    private _router: Router) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.request(url, options));
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
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
    if (!options.headers.has('Content-Type')) {
      options.headers.append('Content-Type', 'application/json');
    }
    return options;
  }

  intercept(observable: Observable<Response>): Observable<Response> {
    return observable.pipe(catchError((err, source) => {
      if (err.status === 401 && !_.endsWith(err.url, '/login')) {
        this._router.navigate(['login']);
        return observableEmpty(null);
      } else {
        return observableThrowError(err);
      }
    }));

  }
}

export function interceptorFactory(
  xhrBackend: XHRBackend,
  requestOptions: RequestOptions,
  router: Router
) {
  return new HttpInterceptor(xhrBackend, requestOptions, router);
}

export const HTTP_PROVIDER = {
  provide: Http,
  useFactory: interceptorFactory,
  deps: [XHRBackend, RequestOptions, Router]
};
