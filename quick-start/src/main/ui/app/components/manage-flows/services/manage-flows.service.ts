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
      console.log('GET /api/flows');
      return res.json();
    }));
  }

  createFlow(newFlow: Object) {
    return this.http.post('http://localhost:4200/api/flows', newFlow).pipe(map((res: Response) => {
      console.log('POST /api/flows');
    }));
  }

  deleteFlow(flowId: string) {
    return this.http.delete('http://localhost:4200/api/flows/' + flowId).pipe(map((res: Response) => {
      console.log('DELETE /api/flows/' + flowId);
    }));
  }

}
