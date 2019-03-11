import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Flow} from "../models/flow.model";


@Injectable()
export class ManageFlowsService {

  constructor(
    private http: HttpClient,
  ) {
  }

  getFlows() {
    console.log('GET /api/flows');
    return this.http.get<Array<Object>>('api/flows');
  }
  getFlowById(id: string) {
    console.log('GET /api/flows/' + id);
    return this.http.get('api/flows/' + id);
  }

  getFlow(flowId) {
    console.log('GET /api/flows/{flowId}');
    return this.http.get<Object>('api/flows/' + flowId);
  }

  createFlow(newFlow: Object) {
    console.log('POST /api/flows');
    console.log(newFlow);
    return this.http.post('api/flows', newFlow);
  }

  deleteFlow(flowId: string) {
    console.log('DELETE /api/flows/' + flowId);
    return this.http.delete('api/flows/' + flowId);
  }

  saveFlow(flow: Flow) {
    console.log(`PUT /api/flows/${flow.id}`);
    console.log(flow);
    return this.http.put(`/api/flows/${flow.id}`, flow);
  }

}
