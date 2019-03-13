import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Flow} from "../models/flow.model";
import { Step } from '../models/step.model';


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

  getSteps(flowId: string) {
    console.log(`GET /api/flows/${flowId}/steps`);
    console.log(flowId);
    return this.http.get<Array<Step>>(`api/flows/${flowId}/steps`);
  }
  createStep(flowId: string, step: Step) {
    console.log(`POST api/flows/${flowId}/steps`);
    return this.http.post<Step>(`api/flows/${flowId}/steps`, step);
  }
  updateStep(flowId: string, stepId: string, step: Step) {
    console.log(`PUT api/flows/${flowId}/steps/${stepId}`);
    return this.http.put<Step>(`api/flows/${flowId}/steps/${stepId}`, step);
  }

  deleteStep(flowId: string, stepId: string) {
    console.log(`DELETE api/flows/${flowId}/steps/${stepId}`);
    return this.http.delete(`api/flows/${flowId}/steps/${stepId}`);
  }
  getCollections(database: string) {
    console.log('GET api/collections/' + database);
    return this.http.get<Array<string>>('api/collections/' + database);
  }
  runFlow(flowId: string) {
    console.log(`POST api/flows/${flowId}/run`);
    return this.http.post(`api/flows/${flowId}/run`, {});
  }
  stopFlow(flowId: string) {
    console.log(`POST api/flows/${flowId}/stop`);
    return this.http.post(`api/flows/${flowId}/stop`, {});
  }
}
