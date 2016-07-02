import {Inject, Injectable} from 'ng-forward';

@Injectable()
@Inject('$http')

/**
 *
 */
export class ProjectService {

  authenticated = false;

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

  getProjects() {
    return this.get('/projects/');
  }

  addProject(path) {
    return this.post(`/projects/?path=${path}`);
  }

  getProject(projectId) {
    return this.get(`/projects/${projectId}`);
  }

  getProjectDefaults(projectId) {
    return this.get(`/projects/${projectId}/defaults`);
  }

  getProjectEnvironment(projectId, environment) {
    return this.get(`/projects/${projectId}/${environment}`);
  }

  initProject(projectId, settings) {
    return this.post(`/projects/${projectId}/initialize`, settings);
  }

  login(projectId, environment, loginInfo) {
    return this.post(`/projects/${projectId}/${environment}/login`, loginInfo);
  }
}
