import {Inject, Injectable} from 'ng-forward';

@Injectable()
@Inject('$http')

/**
 *
 */
export class EntitiesService {
  constructor($http) {
    this.$http = $http;
  }

  get(url) {
    return this.$http.get(url).then(resp => {
      return resp.data;
    });
  }

  post(url, data) {
    return this.$http.post(url, data).then(resp => {
      return resp.data;
    });
  }

  getEntities() {
    return this.get('/entities/');
  }

  getEntity(entityName) {
    return this.get(`/entities/${entityName}`);
  }

  createEntity(entity) {
    return this.post('/entities/', entity);
  }

  createFlow(entity, flowType, flow) {
    return this.post(`/entities/${entity.entityName}/flows/${flowType}`, flow);
  }

  getInputFlowOptions(flow) {
    return this.get(`/entities/${flow.entityName}/flows/INPUT/${flow.flowName}/run/input`);
  }

  runInputFlow(flow, mlcpOptions) {
    return this.post(`/entities/${flow.entityName}/flows/INPUT/${flow.flowName}/run/input`, mlcpOptions);
  }

  runHarmonizeFlow(flow) {
    return this.post(`/entities/${flow.entityName}/flows/HARMONIZE/${flow.flowName}/run`);
  }
}
