import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class ProjectService {

  authenticated = false;
  projectId: string;
  environment: string;

  constructor(private http: Http) {}

  currentProject() {
    return this.get('/current-env');
  }

  getProjects() {
    return this.get('/projects/');
  }

  addProject(path) {
    return this.post(`/projects/?path=${path}`, null);
  }

  removeProject(project) {
    return this.http.delete(`/projects/${project.id}`);
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
    let resp = this.http.post(`/projects/${projectId}/${environment}/login`, loginInfo).share();
    resp.subscribe(() => {
      this.projectId = projectId;
      this.environment = environment;
    });
    return resp;
  }

  logout() {
    return this.http.delete(`/projects/${this.projectId}/${this.environment}/logout`);
  }

  private extractData(res: Response) {
    return res.json();
  }

  private get(url) {
    return this.http.get(url).map(this.extractData);
  }

  private post(url, data) {
    return this.http.post(url, data).map(this.extractData);
  }

}
