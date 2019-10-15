import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { HubSettings } from '../environment/hub-settings.model';
import 'rxjs/add/operator/share';

@Injectable()
export class ProjectService {

  authenticated = false;

  constructor(private http: Http) {}

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

  getProjectEnvironment() {
    return this.get(`/api/current-project/`);
  }

  initProject(projectId: string, settings: HubSettings) {
    return this.post(`/api/projects/${projectId}/initialize`, settings);
  }

  login(projectId: string, environment: string, loginInfo: any) {
    let resp = this.http.post(`/api/login`, loginInfo).share();
    resp.subscribe(() => {
      this.authenticated = true;
    },
    () => {
      this.authenticated = false;
    });
    return resp;
  }

  logout() {
    return this.http.post(`/api/logout`, null);
  }

  getStatus() {
    return this.get(`/api/current-project/stats`);
  }

  clearDatabase(database) {
    return this.http.post(`/api/current-project/clear/${database}`, '');
  }

  clearAllDatabases() {
    return this.http.post(`/api/current-project/clear-all`, '');
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
