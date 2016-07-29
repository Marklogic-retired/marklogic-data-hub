import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class ProjectService {

  authenticated = false;
  projectId: string;
  environment: string;

  constructor(private http: Http) {
    this.projectId = localStorage.getItem('_projectId_');
    this.environment = localStorage.getItem('_environment_');
  }

  getProjects() {
    return this.get('/projects/');
  }

  addProject(path) {
    return this.post(`/projects/?path=${encodeURIComponent(path)}`, null);
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
      localStorage.setItem('_projectId_', this.projectId);
      localStorage.setItem('_environment_', this.environment);
    },
    () => {
      this.projectId = null;
      this.environment = null;
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
