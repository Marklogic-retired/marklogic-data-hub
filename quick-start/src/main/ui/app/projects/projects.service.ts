import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { HubSettings } from '../environment/hub-settings.model';

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
    return this.get('/api/projects/');
  }

  addProject(path: string) {
    return this.post(`/api/projects/?path=${encodeURIComponent(path)}`, '');
  }

  removeProject(project: any) {
    return this.http.delete(`/api/projects/${project.id}`);
  }

  getProject(projectId: string) {
    return this.get(`/api/projects/${projectId}`);
  }

  getProjectDefaults(projectId: string) {
    return this.get(`/api/projects/${projectId}/defaults`);
  }

  getProjectEnvironment(projectId: string, environment: string) {
    return this.get(`/api/projects/${projectId}/${environment}`);
  }

  initProject(projectId: string, settings: HubSettings) {
    return this.post(`/api/projects/${projectId}/initialize`, settings);
  }

  login(projectId: string, environment: string, loginInfo: any) {
    let resp = this.http.post(`/api/projects/${projectId}/${environment}/login`, loginInfo).share();
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
    return this.http.delete(`/api/projects/${this.projectId}/${this.environment}/logout`);
  }

  getStatus() {
    return this.get(`/api/projects/${this.projectId}/${this.environment}/stats`);
  }

  clearDatabase(database) {
    return this.http.post(`/api/projects/${this.projectId}/${this.environment}/clear/${database}`, '');
  }

  clearAllDatabases() {
    return this.http.post(`/api/projects/${this.projectId}/${this.environment}/clear-all`, '');
  }

  private extractData(res: Response) {
    return res.json();
  }

  private get(url: string) {
    return this.http.get(url).map(this.extractData);
  }

  private post(url: string, data: any) {
    return this.http.post(url, data).map(this.extractData);
  }

}
