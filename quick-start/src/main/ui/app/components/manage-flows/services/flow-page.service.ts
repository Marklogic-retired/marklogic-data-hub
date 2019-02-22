import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class FlowsPageService implements Resolve<any> {
  flows: any[];
  onProductsChanged: BehaviorSubject<any>;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    // Set the defaults
    this.onProductsChanged = new BehaviorSubject({});
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {

      Promise.all([
        this.getFlows()
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  /**
   * Get flows
   *
   * @returns {Promise<any>}
   */
  getFlows(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/e-commerce-products')
        .subscribe((response: any) => {
          this.flows = response;
          this.onProductsChanged.next(this.flows);
          resolve(response);
        }, reject);
    });
  }
}
