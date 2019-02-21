import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import {map} from 'rxjs/operators';

import * as _ from 'lodash';

@Injectable()
export class ManageFlowsService {

  flows: Array<Object> = new Array<Object>();

  constructor(
    private http: Http,
  ) {
  }

  getFlows() {
    return this.http.get('http://localhost:4200/api/flows').pipe(map((res: Response) => {
      return res.json();
    }));
  }

}
