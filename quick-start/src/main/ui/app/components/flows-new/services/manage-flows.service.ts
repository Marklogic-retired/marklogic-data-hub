import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Flow} from "../models/flow.model";


@Injectable()
export class ManageFlowsService {

  flows: Array<Object> = new Array<Object>();

  constructor(
    private http: HttpClient,
  ) {
  }

  getFlows() {
    console.log('GET /api/flows');
    return this.http.get<Array<Object>>('api/flows');
  }

  createFlow(newFlow: Object) {
    console.log('POST /api/flows');
    return this.http.post('api/flows', newFlow);
  }

  deleteFlow(flowId: string) {
    console.log('DELETE /api/flows/' + flowId);
    return this.http.delete('api/flows/' + flowId);
  }

  saveFlow(flow: Flow) {
    console.log(`PUT /api/flows/${flow.flowId}`);
    return this.http.put(`/api/flows/${flow.flowId}`, flow);
  }

}
