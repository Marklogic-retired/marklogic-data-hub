import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';

import * as _ from 'lodash';

@Injectable()
export class ManageFlowsService {

  flows: Array<Object> = new Array<Object>();

  constructor(
    private http: Http,
  ) {
  }

  getFlows() {
    this.flows.push({
      name: 'Flow 1',
      description: 'A dummy flow.'
    });
    this.flows.push({
      name: 'Flow 2',
      description: 'Another dummy flow.'
    });
    console.log('Getting flows', this.flows);
    // TODO
    return this.flows;
  }

}
