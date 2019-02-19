import { Injectable } from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import { HubSettings } from '../../models/hub-settings.model';
import {share, map} from 'rxjs/operators';

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
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let resp = this.http.post(`/api/login`, loginInfo, options).pipe(share());
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

  preinstallCheck() {
    return this.get(`api/current-project/preinstall-check`);
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

  updateProject() {
    return this.http.post(`/api/current-project/update-hub`, '');
  }

  private extractData(res: Response) {
    return res.json();
  }

  private get(url: string) {
    return this.http.get(url).pipe(map(this.extractData));
  }

  private post(url: string, data: any) {
    return this.http.post(url, data).pipe(map(this.extractData));
  }

}
